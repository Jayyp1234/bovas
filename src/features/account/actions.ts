"use server";

import { revalidatePath } from "next/cache";
import { actionFailure, type ActionResult } from "@/lib/action-result";
import { changePassword, updateMe } from "@/lib/api/account";
import type { ChangePasswordRequest, UpdateMeRequest } from "@/lib/api/types";

export async function updateProfileAction(patch: UpdateMeRequest): Promise<ActionResult> {
  try {
    await updateMe(patch);
  } catch (error) {
    return actionFailure(error, "We couldn't save your profile. Try again.");
  }

  // The name shows in every workspace's top bar.
  revalidatePath("/", "layout");
  return { ok: true, message: "Profile saved." };
}

export async function changePasswordAction(input: ChangePasswordRequest): Promise<ActionResult> {
  try {
    await changePassword(input);
  } catch (error) {
    return actionFailure(error, "We couldn't change your password. Try again.");
  }

  return { ok: true, message: "Password changed. You've been signed out on other devices." };
}
