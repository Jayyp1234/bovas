import { ApiError } from "../client";
import type {
  ChecklistItem,
  ChecklistItemList,
  Inspection,
  InspectionInput,
  InspectionOutcome,
  InspectionPage,
  InspectionQuery,
  QueueTicketList,
  SafetyQueueQuery,
  TicketDetail,
} from "../types";
import {
  STAFF,
  VALIDATION_MESSAGE,
  matchesSearch,
  minutesWaiting,
  nowTimestamp,
  paginate,
} from "./shared";
import { tickets } from "./tickets";

/*
 * The queue and history are read from the ticket fixtures, so an inspection recorded in demo
 * mode moves the ticket along everywhere, as it does with the API.
 */

export async function getSafetyQueue(query: SafetyQueueQuery = {}): Promise<QueueTicketList> {
  const data = tickets
    .filter((ticket) => ticket.status === "awaiting_safety")
    .filter((ticket) => !query.truck_type || ticket.truck.type === query.truck_type)
    .filter((ticket) =>
      matchesSearch(query.q, ticket.ticket_no, ticket.truck.plate, ticket.driver?.name, ticket.customer.name),
    )
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .map((ticket) => ({
      ticket_no: ticket.ticket_no,
      customer: ticket.customer,
      truck: ticket.truck,
      product: ticket.product,
      requested_litres: ticket.requested_litres,
      driver: ticket.driver,
      waiting_minutes: minutesWaiting(ticket.created_at),
    }));

  return { data, meta: { total: data.length } };
}

function section(no: number, title: string, items: [key: string, label: string][]): ChecklistItem[] {
  return items.map(([key, label]) => ({
    key,
    label,
    section_no: no,
    section_title: title,
    input: "toggle",
  }));
}

export const checklist: ChecklistItem[] = [
  ...section(1, "PPE & Personnel Compliance", [
    ["head_hat", "Head Hat"],
    ["safety_boots", "Safety Boots"],
    ["reflective_gadgets", "Reflective Gadgets"],
  ]),
  ...section(2, "Fire & Static Prevention", [
    ["fire_extinguisher", "Fire Extinguisher"],
    ["spark_arrestor", "Spark Arrestor"],
  ]),
  ...section(3, "Mechanical Integrity", [["brake_system", "Brake System"]]),
  {
    key: "spare_tyre",
    label: "Spare Tyre",
    section_no: 3,
    section_title: "Mechanical Integrity",
    input: "count",
    max: 2,
  },
  ...section(4, "Signage & Environmental Safety", [
    ["warning_triangles", "Warning Caution Triangles"],
    ["inflammable_sign", "Highly Inflammable Sign"],
    ["reflective_bar_sign", "Reflective bar sign"],
  ]),
];

export async function getSafetyChecklist(): Promise<ChecklistItemList> {
  return { data: checklist };
}

/** Admin Settings replaces the checklist in demo mode. */
export function replaceChecklist(items: ChecklistItem[]): void {
  checklist.splice(0, checklist.length, ...items);
}

type InspectedTicket = TicketDetail & { inspection: InspectionOutcome };

function isInspected(ticket: TicketDetail): ticket is InspectedTicket {
  return ticket.inspection !== null;
}

function toInspection({ inspection, ...ticket }: InspectedTicket): Inspection {
  return {
    ticket_no: ticket.ticket_no,
    terminal: ticket.terminal,
    customer: ticket.customer,
    truck: ticket.truck,
    driver: ticket.driver,
    ...inspection,
  };
}

/** `period` and `year` are ignored: every sample inspection is from the same day. */
export async function listInspections(query: InspectionQuery = {}): Promise<InspectionPage> {
  const records = tickets
    .filter(isInspected)
    .map(toInspection)
    .sort((a, b) => b.inspected_at.localeCompare(a.inspected_at));
  const matches = records
    .filter((record) => !query.result || record.result === query.result)
    .filter((record) =>
      matchesSearch(query.q, record.ticket_no, record.customer.name, record.truck.plate, record.driver?.name),
    );
  const { data, meta } = paginate(matches, query.page, query.per_page);

  return {
    data,
    meta: {
      ...meta,
      summary: {
        inspected: records.length,
        approved: records.filter((record) => record.result === "approved").length,
        rejected: records.filter((record) => record.result === "rejected").length,
        generated_at: nowTimestamp(),
      },
    },
  };
}

export async function getInspection(ticketNo: string): Promise<Inspection | null> {
  const ticket = tickets.find((current) => current.ticket_no === ticketNo);
  return ticket && isInspected(ticket) ? toInspection(ticket) : null;
}

/** The API's inspection rules: approval needs every toggle checked; rejection needs a reason. */
export async function inspectTicket(ticketNo: string, input: InspectionInput): Promise<Inspection> {
  const ticket = tickets.find((current) => current.ticket_no === ticketNo);
  if (!ticket) {
    throw new ApiError(404, `Ticket ${ticketNo} was not found.`);
  }
  if (ticket.status !== "awaiting_safety") {
    throw new ApiError(409, `Ticket ${ticketNo} isn't waiting for a safety inspection.`);
  }

  const unchecked = checklist
    .filter((item) => item.input === "toggle" && input.checks[item.key] !== true)
    .map((item) => item.label);
  if (input.result === "approved" && unchecked.length > 0) {
    throw new ApiError(422, VALIDATION_MESSAGE, {
      checks: [`Every item must pass before the truck can be approved. Not checked: ${unchecked.join(", ")}.`],
    });
  }
  if (input.result === "rejected" && !input.reason_code) {
    throw new ApiError(422, VALIDATION_MESSAGE, {
      reason_code: ["Choose why the truck failed the inspection."],
    });
  }

  ticket.status = input.result === "approved" ? "approved_for_loading" : "rejected";
  ticket.inspection = {
    result: input.result,
    reason_code: input.result === "approved" ? null : (input.reason_code ?? null),
    notes: input.notes?.trim() || null,
    inspector: STAFF.safetyOfficer,
    inspected_at: nowTimestamp(),
  };

  return toInspection(ticket as InspectedTicket);
}
