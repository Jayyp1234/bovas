import { loadingOutcome } from "@/domain/overload";
import { ApiError } from "../client";
import type {
  DispatchQueueList,
  DispatchStage,
  GateClearance,
  OverloadDecision,
  OverloadDecisionInput,
  StaffRef,
  TicketDetail,
  TicketStatus,
  Waybill,
} from "../types";
import { overloadTolerancePercent } from "./settings";
import { STAFF, VALIDATION_MESSAGE, minutesWaiting, nowTimestamp } from "./shared";
import { tickets } from "./tickets";

/*
 * Dispatch in demo mode moves the ticket fixtures along, so the queues, ticket pages and audit
 * log all agree, as they do with the API.
 */

/** The Dispatch demo account, which loads trucks and issues waybills in demo mode. */
const DEMO_DISPATCHER: StaffRef = { staff_no: "BO010", name: "Modupe Johnson" };

/** Registered capacity by plate, as seeded by bovas-api. Unregistered trucks count as 0. */
const CAPACITY: Record<string, number> = {
  BDJ580XB: 45000,
  BDJ590XA: 45000,
  "T245-YA": 33000,
  "T12345-LA": 60000,
  AAA771BD: 33000,
  KJA402XC: 45000,
  LSR118AA: 45000,
};

export function capacityOf(plate: string): number {
  return CAPACITY[plate] ?? 0;
}

const STATUS_FOR_STAGE: Record<DispatchStage, TicketStatus> = {
  loading: "approved_for_loading",
  waybill: "loaded",
  gate: "waybill_issued",
};

/** Where a ticket is, for "Ticket 24989001 is …" when a step comes at the wrong time. */
const WHERE: Record<TicketStatus, string> = {
  awaiting_safety: "waiting for Safety",
  approved_for_loading: "waiting to load",
  rejected: "rejected by Safety",
  overload_pending: "waiting for an overload decision",
  overload_denied: "refused for overloading",
  loaded: "loaded and waiting for its waybill",
  waybill_issued: "waiting to clear the gate",
  gate_cleared: "already through the gate",
};

export interface OverloadDecisionRecord {
  decision: OverloadDecision;
  note: string | null;
  admin: StaffRef;
  at: string;
}

/** Ticket number → the admin's decision on its overload. */
export const overloadDecisions = new Map<string, OverloadDecisionRecord>();

/** Waybill number → waybill. */
export const waybills = new Map<string, Waybill>();

/** Ticket number → gate clearance. */
export const gateClearances = new Map<string, GateClearance>();

let nextWaybillNo = 1234567;

function ticketAt(ticketNo: string, needed: TicketStatus): TicketDetail {
  const ticket = tickets.find((current) => current.ticket_no === ticketNo);
  if (!ticket) {
    throw new ApiError(404, `Ticket ${ticketNo} was not found.`);
  }
  if (ticket.status !== needed) {
    throw new ApiError(409, `Ticket ${ticketNo} is ${WHERE[ticket.status]}.`);
  }
  return ticket;
}

/** When the ticket last moved on: the wait at its current stage counts from here. */
function lastMovedAt(ticket: TicketDetail): string {
  return [
    ticket.created_at,
    ticket.inspection?.inspected_at,
    ticket.loading?.recorded_at,
    overloadDecisions.get(ticket.ticket_no)?.at,
    ticket.waybill?.issued_at,
  ]
    .filter((at): at is string => Boolean(at))
    .sort()
    .at(-1) as string;
}

export async function getDispatchQueue(stage: DispatchStage): Promise<DispatchQueueList> {
  const data = tickets
    .filter((ticket) => ticket.status === STATUS_FOR_STAGE[stage])
    .map((ticket) => ({
      ticket_no: ticket.ticket_no,
      stage,
      customer: ticket.customer,
      truck: { ...ticket.truck, capacity_litres: capacityOf(ticket.truck.plate) },
      product: ticket.product,
      requested_litres: ticket.requested_litres,
      waiting_minutes: minutesWaiting(lastMovedAt(ticket)),
    }))
    .sort((a, b) => b.waiting_minutes - a.waiting_minutes);

  return { data, meta: { total: data.length, overload_tolerance_percent: overloadTolerancePercent() } };
}

export async function recordLoading(ticketNo: string, actualLitres: number): Promise<TicketDetail> {
  if (!Number.isInteger(actualLitres) || actualLitres < 1) {
    throw new ApiError(422, VALIDATION_MESSAGE, { actual_litres: ["Actual litres must be at least 1."] });
  }

  const ticket = ticketAt(ticketNo, "approved_for_loading");
  const outcome = loadingOutcome(
    actualLitres,
    ticket.requested_litres,
    capacityOf(ticket.truck.plate),
    overloadTolerancePercent(),
  );
  ticket.loading = {
    actual_litres: actualLitres,
    variance_litres: actualLitres - ticket.requested_litres,
    outcome,
    loader: DEMO_DISPATCHER,
    recorded_at: nowTimestamp(),
  };
  ticket.status = outcome === "overloaded" ? "overload_pending" : "loaded";

  return ticket;
}

export async function decideOverload(ticketNo: string, input: OverloadDecisionInput): Promise<TicketDetail> {
  const ticket = ticketAt(ticketNo, "overload_pending");
  overloadDecisions.set(ticketNo, {
    decision: input.decision,
    note: input.note?.trim() || null,
    admin: STAFF.depotManager,
    at: nowTimestamp(),
  });
  ticket.status = input.decision === "approved" ? "loaded" : "overload_denied";

  return ticket;
}

export async function issueWaybill(ticketNo: string): Promise<Waybill> {
  const ticket = ticketAt(ticketNo, "loaded");
  const waybill: Waybill = {
    waybill_no: `A${nextWaybillNo++}`,
    ticket_no: ticket.ticket_no,
    issued_at: nowTimestamp(),
    dispatcher: DEMO_DISPATCHER,
    terminal: ticket.terminal,
    customer: ticket.customer,
    truck: { ...ticket.truck, capacity_litres: capacityOf(ticket.truck.plate) },
    driver: ticket.driver,
    product: ticket.product,
    actual_litres: ticket.loading?.actual_litres ?? ticket.requested_litres,
    destinations: ticket.destinations,
  };
  waybills.set(waybill.waybill_no, waybill);
  ticket.waybill = { waybill_no: waybill.waybill_no, issued_at: waybill.issued_at };
  ticket.status = "waybill_issued";

  return waybill;
}

export async function clearGate(ticketNo: string): Promise<GateClearance> {
  const ticket = ticketAt(ticketNo, "waybill_issued");
  const clearance: GateClearance = {
    ticket_no: ticketNo,
    cleared_by: DEMO_DISPATCHER,
    cleared_at: nowTimestamp(),
  };
  gateClearances.set(ticketNo, clearance);
  ticket.gate_cleared_at = clearance.cleared_at;
  ticket.status = "gate_cleared";

  return clearance;
}

export async function getWaybill(waybillNo: string): Promise<Waybill | null> {
  return waybills.get(waybillNo) ?? null;
}
