"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { inspectTicket } from "@/lib/api/safety";
import type { InspectionInput, InspectionResult } from "@/lib/api/types";

export type InspectionSubmission =
  | { ok: true; result: InspectionResult }
  | { ok: false; message: string };

/** Records Safety's decision, then refreshes the queue and its badge. */
export async function submitInspection(
  ticketNo: string,
  input: InspectionInput,
): Promise<InspectionSubmission> {
  try {
    const inspection = await inspectTicket(ticketNo, input);
    revalidatePath("/safety", "layout");
    return { ok: true, result: inspection.result };
  } catch (error) {
    unstable_rethrow(error);

    if (error instanceof ApiError && error.status < 500) {
      // The checklist and reason are single controls, so their messages read best as one line.
      const messages = Object.values(error.fieldErrors).flat();
      if (error.status === 409) revalidatePath("/safety", "layout");
      return { ok: false, message: messages.length > 0 ? messages.join(" ") : error.message };
    }

    console.error(error);
    return { ok: false, message: "We couldn't record the inspection. Check your connection and try again." };
  }
}
