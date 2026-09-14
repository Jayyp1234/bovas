"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import {
  previewLoadingProgram,
  uploadLoadingProgram as saveLoadingProgram,
} from "@/lib/api/programs";
import { decideOverload } from "@/lib/api/dispatch";
import type { LoadingProgram, OverloadDecisionInput, ProgramPreview } from "@/lib/api/types";

export interface ProgramUploadResult {
  /** The check of every row. */
  preview?: ProgramPreview;
  /** Set once the program is saved. */
  program?: LoadingProgram;
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

/** Checks a program CSV without saving it. The form carries `file`, `date` and `terminal_id`. */
export async function checkLoadingProgram(form: FormData): Promise<ProgramUploadResult> {
  try {
    return { preview: await previewLoadingProgram(withoutEmptyFile(form)) };
  } catch (error) {
    return failure(error);
  }
}

/** Saves the program so Logistics can start tickets from it. */
export async function uploadLoadingProgram(form: FormData): Promise<ProgramUploadResult> {
  try {
    const program = await saveLoadingProgram(withoutEmptyFile(form));
    revalidatePath("/loading-program");
    return { program };
  } catch (error) {
    return failure(error);
  }
}

export type OverloadDecisionResult = { ok: true; message: string } | { ok: false; message: string };

/** Approves or denies an overloaded truck, then refreshes the admin pages. */
export async function decideOverloadAction(
  ticketNo: string,
  input: OverloadDecisionInput,
): Promise<OverloadDecisionResult> {
  try {
    const ticket = await decideOverload(ticketNo, input);
    revalidatePath("/admin", "layout");
    return {
      ok: true,
      message:
        ticket.status === "loaded"
          ? `Overload approved. Ticket #${ticketNo} can get its waybill.`
          : `Overload denied. Ticket #${ticketNo} won't leave with this load.`,
    };
  } catch (error) {
    unstable_rethrow(error);

    if (error instanceof ApiError && error.status < 500) {
      if (error.status === 409) revalidatePath("/admin", "layout");
      const messages = Object.values(error.fieldErrors).flat();
      return { ok: false, message: messages.length > 0 ? messages.join(" ") : error.message };
    }

    console.error(error);
    return { ok: false, message: "We couldn't record the decision. Check your connection and try again." };
  }
}

/**
 * A file input left empty still submits an empty file part. Dropping it means the API sees no
 * file at all and says "Choose a CSV file", rather than complaining about the file type.
 */
function withoutEmptyFile(form: FormData): FormData {
  const file = form.get("file");
  if (file instanceof File && file.size === 0) {
    form.delete("file");
  }
  return form;
}

function failure(error: unknown): ProgramUploadResult {
  unstable_rethrow(error);

  if (error instanceof ApiError && error.status === 422) {
    // Row problems arrive keyed "rows.<row number>"; show them like the preview does.
    const rowErrors = Object.entries(error.fieldErrors)
      .filter(([key]) => key.startsWith("rows."))
      .flatMap(([key, messages]) => messages.map((message) => ({ row: Number(key.slice(5)), message })));

    return rowErrors.length > 0
      ? { preview: { valid_rows: 0, errors: rowErrors } }
      : { fieldErrors: error.fieldErrors };
  }

  if (error instanceof ApiError && error.status < 500) {
    return { message: error.message };
  }

  console.error(error);
  return { message: "We couldn't reach the BOVAS server. Check your connection and try again." };
}
