import "server-only";
import { apiRequest, fromApi, isLive, orNull } from "./client";
import * as mock from "./mock/tickets";
import type { TicketDetail, TicketInput, TicketPage, TicketPatch, TicketQuery } from "./types";

/** The build phase that implements tickets (x-phase in openapi.yaml). */
const PHASE = 3;

/** Loading tickets. `GET /api/tickets` */
export function listTickets(query: TicketQuery = {}): Promise<TicketPage> {
  return fromApi<TicketPage>(
    PHASE,
    () => apiRequest("/api/tickets", { query }),
    () => mock.listTickets(query),
  );
}

/** One ticket with its history, or null. `GET /api/tickets/{ticket_no}` */
export function getTicket(ticketNo: string): Promise<TicketDetail | null> {
  return fromApi<TicketDetail | null>(
    PHASE,
    () => orNull(apiRequest<TicketDetail>(`/api/tickets/${encodeURIComponent(ticketNo)}`)),
    () => mock.getTicket(ticketNo),
  );
}

/** Generates a ticket and puts it in the Safety queue. `POST /api/tickets` — 422 lists field errors. */
export function createTicket(input: TicketInput): Promise<TicketDetail> {
  return isLive(PHASE)
    ? apiRequest("/api/tickets", { method: "POST", body: input })
    : mock.createTicket(input);
}

/** Edits a ticket Safety hasn't inspected yet. `PATCH /api/tickets/{ticket_no}` — 409 once inspected. */
export function updateTicket(ticketNo: string, patch: TicketPatch): Promise<TicketDetail> {
  return isLive(PHASE)
    ? apiRequest(`/api/tickets/${encodeURIComponent(ticketNo)}`, { method: "PATCH", body: patch })
    : mock.updateTicket(ticketNo, patch);
}
