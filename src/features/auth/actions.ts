"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { landingPath } from "@/domain/roles";
import { ApiError } from "@/lib/api/client";
import {
  login,
  logout,
  requestPasswordReset as sendResetLink,
  resetPassword as applyNewPassword,
} from "@/lib/api/auth";
import { endSession, getSessionToken, startSession } from "@/lib/auth/session";
import type { FormState } from "./form-state";

/** Turns an API error into form feedback. Anything unexpected is logged and reported generically. */
function toFormState(error: unknown, values: Record<string, string>): FormState {
  // Let Next.js redirects and other control-flow errors through.
  unstable_rethrow(error);

  if (error instanceof ApiError) {
    const hasFieldErrors = Object.keys(error.fieldErrors).length > 0;
    return {
      message: hasFieldErrors ? undefined : error.message,
      fieldErrors: error.fieldErrors,
      values,
    };
  }

  console.error(error);
  return {
    message: "We couldn't reach the BOVAS server. Check your connection and try again.",
    values,
  };
}

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function signIn(_previous: FormState, formData: FormData): Promise<FormState> {
  const email = field(formData, "email").trim();
  let destination: string;

  try {
    const session = await login({ email, password: field(formData, "password") });
    await startSession(session.token, session.expires_at, formData.get("remember") === "on");
    destination = session.user.role
      ? landingPath(session.user.role, field(formData, "next"))
      : "/no-access";
  } catch (error) {
    return toFormState(error, { email });
  }

  redirect(destination);
}

export async function signOut(): Promise<void> {
  const token = await getSessionToken();
  await endSession();

  if (token) {
    // The cookie is already gone. If the API can't revoke the token now, it still expires on its own.
    await logout(token).catch((error: unknown) => console.error("Couldn't revoke the session token.", error));
  }

  redirect("/");
}

export async function requestPasswordReset(_previous: FormState, formData: FormData): Promise<FormState> {
  const email = field(formData, "email").trim();

  try {
    return { succeeded: true, message: await sendResetLink(email), values: { email } };
  } catch (error) {
    return toFormState(error, { email });
  }
}

export async function resetPassword(_previous: FormState, formData: FormData): Promise<FormState> {
  try {
    await applyNewPassword({
      token: field(formData, "token"),
      password: field(formData, "password"),
      password_confirmation: field(formData, "password_confirmation"),
    });
  } catch (error) {
    return toFormState(error, {});
  }

  redirect("/?reason=password-reset");
}
