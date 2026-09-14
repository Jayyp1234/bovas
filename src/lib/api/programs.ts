import "server-only";
import { apiRequest, fromApi, isLive } from "./client";
import * as mock from "./mock/programs";
import type { LoadingProgram, ProgramItemPage, ProgramItemQuery, ProgramPreview } from "./types";

/** The build phase that implements loading programs (x-phase in openapi.yaml). */
const PHASE = 3;

/** Trucks on the loading program. `GET /api/program-items` */
export function listProgramItems(query: ProgramItemQuery = {}): Promise<ProgramItemPage> {
  return fromApi<ProgramItemPage>(
    PHASE,
    () => apiRequest("/api/program-items", { query }),
    () => mock.listProgramItems(query),
  );
}

/**
 * Checks a program CSV without saving it. `POST /api/loading-programs/preview`
 * The form carries `file`, `date` and `terminal_id`.
 */
export function previewLoadingProgram(form: FormData): Promise<ProgramPreview> {
  return isLive(PHASE)
    ? apiRequest("/api/loading-programs/preview", { method: "POST", body: form })
    : mock.previewLoadingProgram(form);
}

/** Saves the day's program. `POST /api/loading-programs` — 422 with `rows.<n>` errors if any row is invalid. */
export function uploadLoadingProgram(form: FormData): Promise<LoadingProgram> {
  return isLive(PHASE)
    ? apiRequest("/api/loading-programs", { method: "POST", body: form })
    : mock.uploadLoadingProgram(form);
}
