import { ApiError } from "../client";
import type { LoginRequest, LoginResponse, ResetPasswordRequest, User } from "../types";
import { findStaffByEmail, findStaffByNo } from "./staff";

/*
 * Demo sign-in for when no PHP API is connected (e.g. the Vercel preview). Accounts and the
 * password match bovas-api's seeder. Mock tokens are predictable, which is fine only because
 * mock mode serves nothing but sample data.
 */

export const DEMO_PASSWORD = "Bovas@2026";

/** One sign-in per workspace, as seeded by bovas-api. */
export const DEMO_ACCOUNTS: { workspace: string; email: string }[] = [
  { workspace: "Logistics", email: "olatejuoyetoke@bovasgroups.com" },
  { workspace: "Admin", email: "olayinkafagboore@bovasgroups.com" },
  { workspace: "Safety", email: "abdullahaiyedun@bovasgroups.com" },
  { workspace: "Dispatch", email: "modupejohnson@bovasgroups.com" },
];

const TOKEN_PREFIX = "mock-session:";
const SHIFT_MS = 12 * 60 * 60 * 1000;

export async function login({ email, password }: LoginRequest): Promise<LoginResponse> {
  const fieldErrors: Record<string, string[]> = {};
  if (!email.trim()) fieldErrors.email = ["Email is required."];
  if (!password) fieldErrors.password = ["Password is required."];
  if (Object.keys(fieldErrors).length > 0) {
    throw new ApiError(422, "Check the highlighted fields and try again.", fieldErrors);
  }

  const user = findStaffByEmail(email);
  if (!user || password !== DEMO_PASSWORD) {
    throw new ApiError(401, "Email or password is incorrect.");
  }
  if (!user.active) {
    throw new ApiError(401, "This account has been deactivated. Ask an admin to reactivate it.");
  }
  if (!user.role) {
    throw new ApiError(403, "This account doesn't have access to the BOVAS app.");
  }

  return {
    token: `${TOKEN_PREFIX}${user.staff_no}`,
    expires_at: new Date(Date.now() + SHIFT_MS).toISOString(),
    user,
  };
}

export async function getMe(token: string): Promise<User | null> {
  if (!token.startsWith(TOKEN_PREFIX)) return null;
  const user = findStaffByNo(token.slice(TOKEN_PREFIX.length));
  return user?.active && user.role ? user : null;
}

export async function requestPasswordReset(email: string): Promise<string> {
  if (!email.trim()) {
    throw new ApiError(422, "Check the highlighted fields and try again.", {
      email: ["Email is required."],
    });
  }
  return "If an account exists for that email, we've sent a link to reset the password. It expires in 60 minutes.";
}

/** Demo mode has no emails or stored passwords, so any reset "succeeds". */
export async function resetPassword({ password, password_confirmation }: ResetPasswordRequest): Promise<void> {
  if (password.length < 8) {
    throw new ApiError(422, "Check the highlighted fields and try again.", {
      password: ["Password must be at least 8 characters."],
    });
  }
  if (password !== password_confirmation) {
    throw new ApiError(422, "Check the highlighted fields and try again.", {
      password: ["Password confirmation does not match."],
    });
  }
}
