import "server-only";
import { apiRequest, fromApi, isLive, orNull } from "./client";
import * as mock from "./mock/safety";
import type {
  ChecklistItemList,
  Inspection,
  InspectionInput,
  InspectionPage,
  InspectionQuery,
  QueueTicketList,
  SafetyQueueQuery,
} from "./types";

/** The build phase that implements the safety workflow (x-phase in openapi.yaml). */
const PHASE = 3;

/** Tickets waiting for inspection, longest wait first. `GET /api/safety/queue` */
export function getSafetyQueue(query: SafetyQueueQuery = {}): Promise<QueueTicketList> {
  return fromApi<QueueTicketList>(
    PHASE,
    () => apiRequest("/api/safety/queue", { query }),
    () => mock.getSafetyQueue(query),
  );
}

/** The inspection checklist in display order. `GET /api/safety/checklist` */
export function getSafetyChecklist(): Promise<ChecklistItemList> {
  return fromApi<ChecklistItemList>(
    PHASE,
    () => apiRequest("/api/safety/checklist"),
    () => mock.getSafetyChecklist(),
  );
}

/** Approves or rejects a truck. `POST /api/tickets/{ticket_no}/inspection` — 409 if already inspected. */
export function inspectTicket(ticketNo: string, input: InspectionInput): Promise<Inspection> {
  return isLive(PHASE)
    ? apiRequest(`/api/tickets/${encodeURIComponent(ticketNo)}/inspection`, { method: "POST", body: input })
    : mock.inspectTicket(ticketNo, input);
}

/** Inspection history with period totals. `GET /api/inspections` */
export function listInspections(query: InspectionQuery = {}): Promise<InspectionPage> {
  return fromApi<InspectionPage>(
    PHASE,
    () => apiRequest("/api/inspections", { query }),
    () => mock.listInspections(query),
  );
}

/** The inspection of one ticket, or null. `GET /api/inspections/{ticket_no}` */
export function getInspection(ticketNo: string): Promise<Inspection | null> {
  return fromApi<Inspection | null>(
    PHASE,
    () => orNull(apiRequest<Inspection>(`/api/inspections/${encodeURIComponent(ticketNo)}`)),
    () => mock.getInspection(ticketNo),
  );
}
