import { DEPOT_TIME_ZONE } from "@/lib/format";
import type {
  AuditDetail,
  AuditEntry,
  AuditEntryPage,
  AuditQuery,
  AuditStatus,
  StaffOnDuty,
  TicketDetail,
  TicketStatus,
  TimelineEntry,
} from "../types";
import { capacityOf, gateClearances, overloadDecisions, waybills } from "./dispatch";
import { matchesSearch, paginate } from "./shared";
import { tickets } from "./tickets";

/*
 * The audit log is told from the ticket fixtures and what demo-mode dispatch recorded, the way
 * bovas-api tells it from `audit_events`.
 */

/** Mirrors TicketStatus::auditStatus() in bovas-api. */
function auditStatus(status: TicketStatus): AuditStatus {
  if (status === "gate_cleared") return "completed";
  if (status === "rejected" || status === "overload_denied") return "failed";
  return "pending";
}

const REASON_LABEL: Record<string, string> = {
  ppe: "PPE",
  fire_safety: "fire safety",
  mechanical: "mechanical faults",
  signage: "signage",
  other: "another reason",
};

/** Mirrors AuditRepository::reason() in bovas-api. */
function reason(ticket: TicketDetail): string | null {
  switch (ticket.status) {
    case "awaiting_safety":
      return "Waiting for the safety inspection.";
    case "approved_for_loading":
      return "Approved by Safety and waiting to load.";
    case "rejected": {
      const label = REASON_LABEL[ticket.inspection?.reason_code ?? "other"];
      return `Rejected by Safety for ${label}${ticket.inspection?.notes ? `: ${ticket.inspection.notes}` : "."}`;
    }
    case "overload_pending":
      return "Awaiting approval from admin due to overloading.";
    case "overload_denied": {
      const note = overloadDecisions.get(ticket.ticket_no)?.note;
      return `Overload denied by admin${note ? `: ${note}` : "."}`;
    }
    case "loaded":
      return "Loaded and waiting for the waybill.";
    case "waybill_issued":
      return "Waybill issued; waiting to clear the gate.";
    default:
      return null;
  }
}

function depotDate(timestamp: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: DEPOT_TIME_ZONE }).format(new Date(timestamp));
}

/** Mirrors AuditRepository's labels in bovas-api, in the order things happened. */
function timeline(ticket: TicketDetail): TimelineEntry[] {
  const entries: TimelineEntry[] = [
    { event: "ticket_created", label: "Loading Ticket Created", at: ticket.created_at },
  ];

  if (ticket.inspection) {
    entries.push({
      event: "safety_inspected",
      label: ticket.inspection.result === "rejected" ? "Rejected by Safety" : "Approved by Safety",
      at: ticket.inspection.inspected_at,
    });
  }
  if (ticket.loading) {
    entries.push({
      event: "loading_recorded",
      label: ticket.loading.outcome === "overloaded" ? "Loaded (Overloaded)" : "Loaded",
      at: ticket.loading.recorded_at,
    });
  }
  const decision = overloadDecisions.get(ticket.ticket_no);
  if (decision) {
    entries.push({
      event: "overload_decided",
      label: decision.decision === "denied" ? "Overload Denied" : "Overload Approved",
      at: decision.at,
    });
  }
  if (ticket.waybill) {
    entries.push({ event: "waybill_issued", label: "Waybill Issued", at: ticket.waybill.issued_at });
  }
  if (ticket.gate_cleared_at) {
    entries.push({ event: "gate_cleared", label: "Gate Cleared", at: ticket.gate_cleared_at });
  }

  return entries.sort((a, b) => a.at.localeCompare(b.at));
}

/** The person who acted in each role, in the order the roles came up. */
function staffOnDuty(ticket: TicketDetail): StaffOnDuty[] {
  const staff: StaffOnDuty[] = [{ role_label: "Logistics", name: ticket.created_by.name }];

  if (ticket.inspection) {
    staff.push({ role_label: "Safety", name: ticket.inspection.inspector.name });
  }
  if (ticket.loading) {
    staff.push({ role_label: "Loader", name: ticket.loading.loader.name });
  }
  const decision = overloadDecisions.get(ticket.ticket_no);
  if (decision) {
    staff.push({ role_label: "Admin", name: decision.admin.name });
  }
  const dispatcher = ticket.waybill ? waybills.get(ticket.waybill.waybill_no)?.dispatcher : undefined;
  if (dispatcher) {
    staff.push({ role_label: "Dispatch", name: dispatcher.name });
  }
  const gate = gateClearances.get(ticket.ticket_no);
  if (gate) {
    staff.push({ role_label: "Gate", name: gate.cleared_by.name });
  }

  return staff;
}

function toEntry(ticket: TicketDetail): AuditEntry {
  return {
    ticket_no: ticket.ticket_no,
    date: depotDate(ticket.created_at),
    customer: ticket.customer,
    truck: ticket.truck,
    product: ticket.product,
    requested_litres: ticket.requested_litres,
    destination_summary: ticket.destination_summary,
    status: auditStatus(ticket.status),
  };
}

/** `period` and `year` are ignored: every sample ticket is from the same day. */
export async function listAuditEntries(query: AuditQuery = {}): Promise<AuditEntryPage> {
  const matches = [...tickets]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .filter((ticket) => !query.truck_type || ticket.truck.type === query.truck_type)
    .filter((ticket) =>
      matchesSearch(query.q, ticket.ticket_no, ticket.customer.name, ticket.truck.plate, ticket.destination_summary),
    )
    .map(toEntry);

  return paginate(matches, query.page, query.per_page);
}

export async function getAuditDetail(ticketNo: string): Promise<AuditDetail | null> {
  const ticket = tickets.find((current) => current.ticket_no === ticketNo);
  if (!ticket) return null;

  const decision = overloadDecisions.get(ticketNo);

  return {
    ticket_no: ticket.ticket_no,
    date: depotDate(ticket.created_at),
    terminal: ticket.terminal,
    status: auditStatus(ticket.status),
    reason: reason(ticket),
    truck: { ...ticket.truck, capacity_litres: capacityOf(ticket.truck.plate) },
    product: ticket.product,
    loading_summary: ticket.loading && {
      requested_litres: ticket.requested_litres,
      actual_litres: ticket.loading.actual_litres,
      variance_litres: ticket.loading.variance_litres,
      outcome: ticket.loading.outcome,
    },
    waybill_no: ticket.waybill?.waybill_no ?? null,
    timeline: timeline(ticket),
    staff_on_duty: staffOnDuty(ticket),
    overload_approved_by: decision?.decision === "approved" ? decision.admin : null,
  };
}
