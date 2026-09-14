import "server-only";
import { getCurrentUser } from "@/lib/auth/current-user";
import { ApiError, apiRequest, isLive } from "./client";
import * as mock from "./mock/account";
import type { ChangePasswordRequest, UpdateMeRequest, User } from "./types";

/** The build phase that implements account settings (x-phase in openapi.yaml). */
const PHASE = 6;

async function signedInStaffNo(): Promise<string> {
  const user = await getCurrentUser();
  if (!user) {
    throw new ApiError(401, "Your session has ended. Sign in again.");
  }
  return user.staff_no;
}

/** Your own name and phone number. `PATCH /api/me` */
export async function updateMe(patch: UpdateMeRequest): Promise<User> {
  return isLive(PHASE)
    ? apiRequest("/api/me", { method: "PATCH", body: patch })
    : mock.updateMe(await signedInStaffNo(), patch);
}

/** `PUT /api/me/password` — 422 when the current password is wrong. Other sessions are signed out. */
export async function changePassword(input: ChangePasswordRequest): Promise<void> {
  if (isLive(PHASE)) {
    await apiRequest("/api/me/password", { method: "PUT", body: input });
    return;
  }
  return mock.changePassword(input);
}
