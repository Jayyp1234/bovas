import { ApiError } from "../client";
import type { ChangePasswordRequest, UpdateMeRequest, User } from "../types";
import { DEMO_PASSWORD } from "./auth";
import { VALIDATION_MESSAGE } from "./shared";
import { findStaffByNo } from "./staff";

export async function updateMe(staffNo: string, patch: UpdateMeRequest): Promise<User> {
  const user = findStaffByNo(staffNo);
  if (!user) {
    throw new ApiError(401, "Your session has ended. Sign in again.");
  }

  const name = patch.name?.trim();
  const phone = patch.phone?.trim();
  const errors: Record<string, string[]> = {};
  if (patch.name !== undefined && !name) errors.name = ["Name cannot be empty."];
  if (patch.phone !== undefined && !phone) errors.phone = ["Phone cannot be empty."];
  if (Object.keys(errors).length > 0) {
    throw new ApiError(422, VALIDATION_MESSAGE, errors);
  }

  if (name) user.name = name;
  if (phone) user.phone = phone;
  return user;
}

/** Demo accounts share one password, so a valid change is accepted but not kept. */
export async function changePassword(input: ChangePasswordRequest): Promise<void> {
  const errors: Record<string, string[]> = {};
  if (input.current_password !== DEMO_PASSWORD) {
    errors.current_password = ["Your current password is incorrect."];
  } else if (input.password.length < 8) {
    errors.password = ["Password must be at least 8 characters."];
  } else if (input.password !== input.password_confirmation) {
    errors.password = ["Password confirmation does not match."];
  } else if (input.password === DEMO_PASSWORD) {
    errors.password = ["Choose a password different from your current one."];
  }

  if (Object.keys(errors).length > 0) {
    throw new ApiError(422, VALIDATION_MESSAGE, errors);
  }
}
