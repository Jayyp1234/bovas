"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { actionFailure, type ActionResult } from "@/lib/action-result";
import {
  createStaff,
  deleteStaff,
  deleteStaffAvatar,
  setStaffActive,
  updateStaff,
  uploadStaffAvatar,
} from "@/lib/api/staff";
import type { StaffInput, StaffPatch } from "@/lib/api/types";

/** Creates the profile and opens it. Only failures return. */
export async function createStaffAction(input: StaffInput): Promise<ActionResult> {
  let staffNo: string;
  try {
    staffNo = (await createStaff(input)).staff_no;
  } catch (error) {
    return actionFailure(error, "We couldn't create the profile. Try again.");
  }

  revalidatePath("/admin/staff");
  redirect(`/admin/staff/${staffNo}?toast=staff-created`);
}

export async function updateStaffAction(staffNo: string, patch: StaffPatch): Promise<ActionResult> {
  try {
    await updateStaff(staffNo, patch);
  } catch (error) {
    return actionFailure(error, "We couldn't save the profile. Try again.");
  }

  revalidatePath("/admin/staff", "layout");
  return { ok: true, message: "Staff profile saved." };
}

/** Deactivating signs the person out everywhere. */
export async function setStaffActiveAction(staffNo: string, active: boolean): Promise<ActionResult> {
  try {
    const person = await setStaffActive(staffNo, active);
    revalidatePath("/admin/staff", "layout");
    return {
      ok: true,
      message: active ? `${person.name} activated.` : `${person.name} deactivated and signed out.`,
    };
  } catch (error) {
    return actionFailure(error, "We couldn't change the account. Try again.");
  }
}

/** Deletes the profile and returns to the list. Only failures return, e.g. staff with ticket history. */
export async function deleteStaffAction(staffNo: string): Promise<ActionResult> {
  try {
    await deleteStaff(staffNo);
  } catch (error) {
    return actionFailure(error, "We couldn't delete the profile. Try again.");
  }

  revalidatePath("/admin/staff");
  redirect("/admin/staff?toast=staff-deleted");
}

/** The form carries `file`. */
export async function uploadAvatarAction(staffNo: string, form: FormData): Promise<ActionResult> {
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Choose a picture to upload.", fieldErrors: {} };
  }

  try {
    await uploadStaffAvatar(staffNo, form);
  } catch (error) {
    const failure = actionFailure(error, "We couldn't upload the picture. Try again.");
    return { ...failure, message: failure.fieldErrors.file?.[0] ?? failure.message };
  }

  revalidatePath("/admin/staff", "layout");
  return { ok: true, message: "Profile picture updated." };
}

export async function removeAvatarAction(staffNo: string): Promise<ActionResult> {
  try {
    await deleteStaffAvatar(staffNo);
  } catch (error) {
    return actionFailure(error, "We couldn't remove the picture. Try again.");
  }

  revalidatePath("/admin/staff", "layout");
  return { ok: true, message: "Profile picture removed." };
}
