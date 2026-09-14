import "server-only";
import { apiRequest, fromApi, orNull } from "./client";
import * as mock from "./mock/audit";
import type { AuditDetail, AuditEntryPage, AuditQuery } from "./types";

/** The audit log. `GET /api/audit` (phase 4) */
export function listAuditEntries(query: AuditQuery = {}): Promise<AuditEntryPage> {
  return fromApi<AuditEntryPage>(
    4,
    () => apiRequest("/api/audit", { query }),
    () => mock.listAuditEntries(query),
  );
}

/** Everything that happened to one ticket, or null. `GET /api/audit/{ticket_no}` (phase 4) */
export function getAuditDetail(ticketNo: string): Promise<AuditDetail | null> {
  return fromApi<AuditDetail | null>(
    4,
    () => orNull(apiRequest<AuditDetail>(`/api/audit/${encodeURIComponent(ticketNo)}`)),
    () => mock.getAuditDetail(ticketNo),
  );
}
