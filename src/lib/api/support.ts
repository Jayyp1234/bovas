import "server-only";
import { getCurrentUser } from "@/lib/auth/current-user";
import { ApiError, apiRequest, fromApi, isLive } from "./client";
import * as mock from "./mock/support";
import type {
  SupportRequest,
  SupportRequestInput,
  SupportRequestPage,
  SupportRequestQuery,
  SupportStatus,
} from "./types";

/** The build phase that implements support requests (x-phase in openapi.yaml). */
const PHASE = 6;

/** The admin support inbox, newest first. `GET /api/support-requests` */
export function listSupportRequests(query: SupportRequestQuery = {}): Promise<SupportRequestPage> {
  return fromApi<SupportRequestPage>(
    PHASE,
    () => apiRequest("/api/support-requests", { query }),
    () => mock.listSupportRequests(query),
  );
}

/** Asks the admin team for help; admins are notified and emailed. `POST /api/support-requests` */
export async function createSupportRequest(input: SupportRequestInput): Promise<SupportRequest> {
  if (isLive(PHASE)) {
    return apiRequest("/api/support-requests", { method: "POST", body: input });
  }

  const user = await getCurrentUser();
  if (!user) {
    throw new ApiError(401, "Your session has ended. Sign in again.");
  }
  return mock.createSupportRequest(user, input);
}

/** Resolves or reopens a request. `PATCH /api/support-requests/{id}` */
export function updateSupportRequest(id: number, status: SupportStatus): Promise<SupportRequest> {
  return isLive(PHASE)
    ? apiRequest(`/api/support-requests/${id}`, { method: "PATCH", body: { status } })
    : mock.updateSupportRequest(id, status);
}
