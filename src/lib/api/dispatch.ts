import "server-only";
import { apiRequest, fromApi, isLive, orNull } from "./client";
import * as mock from "./mock/dispatch";
import type {
  DispatchQueueList,
  DispatchStage,
  GateClearance,
  OverloadDecisionInput,
  TicketDetail,
  Waybill,
} from "./types";

/** The build phase that implements dispatch (x-phase in openapi.yaml). */
const PHASE = 4;

function ticketStep(ticketNo: string, step: string): string {
  return `/api/tickets/${encodeURIComponent(ticketNo)}/${step}`;
}

/** Trucks waiting at a dispatch stage, longest wait first. `GET /api/dispatch/queue` */
export function getDispatchQueue(stage: DispatchStage): Promise<DispatchQueueList> {
  return fromApi<DispatchQueueList>(
    PHASE,
    () => apiRequest("/api/dispatch/queue", { query: { stage } }),
    () => mock.getDispatchQueue(stage),
  );
}

/**
 * Records the litres a truck loaded. `POST /api/tickets/{ticket_no}/loading-record`
 * Overloaded trucks come back as `overload_pending` and wait for an admin.
 */
export function recordLoading(ticketNo: string, actualLitres: number): Promise<TicketDetail> {
  return isLive(PHASE)
    ? apiRequest(ticketStep(ticketNo, "loading-record"), { method: "POST", body: { actual_litres: actualLitres } })
    : mock.recordLoading(ticketNo, actualLitres);
}

/** An admin approves or denies an overloaded truck. `POST /api/tickets/{ticket_no}/overload-decision` */
export function decideOverload(ticketNo: string, input: OverloadDecisionInput): Promise<TicketDetail> {
  return isLive(PHASE)
    ? apiRequest(ticketStep(ticketNo, "overload-decision"), { method: "POST", body: input })
    : mock.decideOverload(ticketNo, input);
}

/** Issues the waybill for a loaded truck. `POST /api/tickets/{ticket_no}/waybill` */
export function issueWaybill(ticketNo: string): Promise<Waybill> {
  return isLive(PHASE)
    ? apiRequest(ticketStep(ticketNo, "waybill"), { method: "POST" })
    : mock.issueWaybill(ticketNo);
}

/** Lets a truck with a waybill leave, closing its ticket. `POST /api/tickets/{ticket_no}/gate-clearance` */
export function clearGate(ticketNo: string): Promise<GateClearance> {
  return isLive(PHASE)
    ? apiRequest(ticketStep(ticketNo, "gate-clearance"), { method: "POST" })
    : mock.clearGate(ticketNo);
}

/** One waybill for the printable page, or null. `GET /api/waybills/{waybill_no}` */
export function getWaybill(waybillNo: string): Promise<Waybill | null> {
  return fromApi<Waybill | null>(
    PHASE,
    () => orNull(apiRequest<Waybill>(`/api/waybills/${encodeURIComponent(waybillNo)}`)),
    () => mock.getWaybill(waybillNo),
  );
}
