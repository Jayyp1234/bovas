"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { clearGate, issueWaybill, recordLoading } from "@/lib/api/dispatch";
import { formatNumber } from "@/lib/format";

export type DispatchResult =
  | { ok: true; message: string; waybillNo?: string }
  | { ok: false; message: string };

/** Records the litres loaded. Overloaded trucks go to an admin instead of the waybill queue. */
export async function recordLoadingAction(ticketNo: string, actualLitres: number): Promise<DispatchResult> {
  return run(async () => {
    const ticket = await recordLoading(ticketNo, actualLitres);
    return {
      ok: true,
      message:
        ticket.status === "overload_pending"
          ? `Ticket #${ticketNo} is overloaded at ${formatNumber(actualLitres)} litres. It's waiting for an admin to approve it.`
          : `Ticket #${ticketNo} loaded ${formatNumber(actualLitres)} litres and is ready for its waybill.`,
    };
  });
}

export async function issueWaybillAction(ticketNo: string): Promise<DispatchResult> {
  return run(async () => {
    const waybill = await issueWaybill(ticketNo);
    return {
      ok: true,
      message: `Waybill ${waybill.waybill_no} issued for ticket #${ticketNo}.`,
      waybillNo: waybill.waybill_no,
    };
  });
}

export async function clearGateAction(ticketNo: string): Promise<DispatchResult> {
  return run(async () => {
    await clearGate(ticketNo);
    return { ok: true, message: `Ticket #${ticketNo} cleared the gate. Its visit is complete.` };
  });
}

/** Runs a step, refreshes every queue, and turns API errors into a message for the panel. */
async function run(step: () => Promise<DispatchResult>): Promise<DispatchResult> {
  try {
    const result = await step();
    revalidatePath("/dispatch", "layout");
    return result;
  } catch (error) {
    unstable_rethrow(error);

    if (error instanceof ApiError && error.status < 500) {
      // Someone else moved the ticket on; show the queues as they are now.
      if (error.status === 409) revalidatePath("/dispatch", "layout");
      const messages = Object.values(error.fieldErrors).flat();
      return { ok: false, message: messages.length > 0 ? messages.join(" ") : error.message };
    }

    console.error(error);
    return { ok: false, message: "We couldn't save that. Check your connection and try again." };
  }
}
