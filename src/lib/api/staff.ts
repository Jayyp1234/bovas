import "server-only";
import { ApiError, apiDownload, apiRequest, fromApi, isLive, orNull } from "./client";
import * as mock from "./mock/staff";
import type { NextStaffNo, StaffInput, StaffPage, StaffPatch, StaffQuery, User } from "./types";

/** The build phase that implements staff management (x-phase in openapi.yaml). */
const PHASE = 5;

function staffPath(staffNo: string, rest = ""): string {
  return `/api/staff/${encodeURIComponent(staffNo)}${rest}`;
}

/** Staff records. `GET /api/staff` */
export function listStaff(query: StaffQuery = {}): Promise<StaffPage> {
  return fromApi<StaffPage>(
    PHASE,
    () => apiRequest("/api/staff", { query }),
    () => mock.listStaff(query),
  );
}

/** One staff profile, or null. `GET /api/staff/{staff_no}` */
export function getStaff(staffNo: string): Promise<User | null> {
  return fromApi<User | null>(
    PHASE,
    () => orNull(apiRequest<User>(staffPath(staffNo))),
    () => mock.getStaff(staffNo),
  );
}

/** The staff number the next new profile will get. `GET /api/staff/next-number` */
export function getNextStaffNo(): Promise<NextStaffNo> {
  return fromApi<NextStaffNo>(
    PHASE,
    () => apiRequest("/api/staff/next-number"),
    () => mock.getNextStaffNo(),
  );
}

/** Creates a profile and emails the temporary password. `POST /api/staff` */
export function createStaff(input: StaffInput): Promise<User> {
  return isLive(PHASE)
    ? apiRequest("/api/staff", { method: "POST", body: input })
    : mock.createStaff(input);
}

/** `PATCH /api/staff/{staff_no}` */
export function updateStaff(staffNo: string, patch: StaffPatch): Promise<User> {
  return isLive(PHASE)
    ? apiRequest(staffPath(staffNo), { method: "PATCH", body: patch })
    : mock.updateStaff(staffNo, patch);
}

/** Activates or deactivates an account; deactivating signs the person out. `PATCH /api/staff/{staff_no}/status` */
export function setStaffActive(staffNo: string, active: boolean): Promise<User> {
  return isLive(PHASE)
    ? apiRequest(staffPath(staffNo, "/status"), { method: "PATCH", body: { active } })
    : mock.setStaffActive(staffNo, active);
}

/** `DELETE /api/staff/{staff_no}` — 409 when the person appears in ticket history. */
export function deleteStaff(staffNo: string): Promise<void> {
  return isLive(PHASE)
    ? apiRequest(staffPath(staffNo), { method: "DELETE" })
    : mock.deleteStaff(staffNo);
}

/** The form carries `file`. `POST /api/staff/{staff_no}/avatar` */
export function uploadStaffAvatar(staffNo: string, form: FormData): Promise<User> {
  return isLive(PHASE)
    ? apiRequest(staffPath(staffNo, "/avatar"), { method: "POST", body: form })
    : mock.uploadStaffAvatar();
}

/** `DELETE /api/staff/{staff_no}/avatar` */
export function deleteStaffAvatar(staffNo: string): Promise<User> {
  return isLive(PHASE)
    ? apiRequest(staffPath(staffNo, "/avatar"), { method: "DELETE" })
    : mock.deleteStaffAvatar(staffNo);
}

/**
 * The picture behind a user's `avatar_url`, for the /staff-avatars route to stream, or null
 * when there isn't one. `GET /api/staff/{staff_no}/avatar`
 */
export async function getStaffAvatar(staffNo: string): Promise<Response | null> {
  if (!isLive(PHASE)) return null;

  try {
    return await apiDownload(staffPath(staffNo, "/avatar"));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
