import "server-only";
import { unstable_rethrow } from "next/navigation";
import { ApiError } from "@/lib/api/client";

/** What a server action hands back to its form or button. */
export type ActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string; fieldErrors: Record<string, string[]> };

export type ActionFailure = Extract<ActionResult, { ok: false }>;

/**
 * Turns an error caught in a server action into feedback: the API's field errors and message
 * for anything the person can fix, a general message otherwise. Next.js redirects pass through.
 */
export function actionFailure(error: unknown, fallback: string): ActionFailure {
  unstable_rethrow(error);

  if (error instanceof ApiError && error.status < 500) {
    const hasFieldErrors = Object.keys(error.fieldErrors).length > 0;
    return {
      ok: false,
      message: hasFieldErrors ? "Check the highlighted fields and try again." : error.message,
      fieldErrors: error.fieldErrors,
    };
  }

  console.error(error);
  return { ok: false, message: fallback, fieldErrors: {} };
}
