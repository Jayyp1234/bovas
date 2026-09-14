"use server";

import { revalidatePath } from "next/cache";
import { actionFailure, type ActionResult } from "@/lib/action-result";
import { createSupportRequest, updateSupportRequest } from "@/lib/api/support";
import type { SupportRequestInput, SupportStatus } from "@/lib/api/types";

export async function sendSupportRequestAction(input: SupportRequestInput): Promise<ActionResult> {
  try {
    await createSupportRequest(input);
  } catch (error) {
    return actionFailure(error, "We couldn't send your request. Try again.");
  }

  revalidatePath("/admin/support");
  return { ok: true, message: "Request sent. The admin team has been notified." };
}

export async function setSupportStatusAction(id: number, status: SupportStatus): Promise<ActionResult> {
  try {
    await updateSupportRequest(id, status);
  } catch (error) {
    return actionFailure(error, "We couldn't update the request. Try again.");
  }

  revalidatePath("/admin/support");
  return { ok: true, message: status === "resolved" ? "Request marked as resolved." : "Request reopened." };
}
