import { ticketStatusGroup } from "@/domain/labels";
import { formatNumber } from "@/lib/format";
import { ApiError } from "../client";
import type {
  Destination,
  InspectionOutcome,
  MarketerContact,
  Ticket,
  TicketDetail,
  TicketInput,
  TicketPage,
  TicketPatch,
  TicketQuery,
} from "../types";
import {
  CUSTOMERS,
  DRIVERS,
  STAFF,
  TERMINALS,
  VALIDATION_MESSAGE,
  at,
  customerById,
  matchesSearch,
  nowTimestamp,
  paginate,
  terminalById,
  truck,
} from "./shared";

const AKOBO_ADDRESS =
  "Km 45, Lagos-Badagry Expressway, Satellite Town, Ojo Navy Barracks, Lagos state.";

function akobo(station: number, litres: number): Destination {
  return { station: `BOVAS Filling Station, Akobo ${station}`, address: AKOBO_ADDRESS, litres };
}

function babatundeIshola(litres: number): Destination {
  return {
    station: "Babatunde Ishola Filling Station",
    address: "51, Apapa-Oshodi Expressway, Ijeshatedo, Lagos",
    litres,
  };
}

function marketer(name: string): MarketerContact {
  return { name, representative: "Opeyemi Fadenipo", phone: "08104205202" };
}

function approved(utcTime: string): InspectionOutcome {
  return {
    result: "approved",
    reason_code: null,
    notes: null,
    inspector: STAFF.safetyOfficer,
    inspected_at: at(utcTime),
  };
}

function rejectedForPpe(utcTime: string): InspectionOutcome {
  return { ...approved(utcTime), result: "rejected", reason_code: "ppe", notes: "No PPE" };
}

type SampleFields = Pick<
  TicketDetail,
  | "ticket_no"
  | "customer"
  | "truck"
  | "requested_litres"
  | "destination_summary"
  | "destinations"
  | "status"
  | "inspection"
  | "created_at"
> &
  Partial<Pick<TicketDetail, "terminal" | "marketer" | "created_by">>;

function sample(fields: SampleFields): TicketDetail {
  return {
    terminal: TERMINALS.one,
    product: "PMS",
    marketer: null,
    driver: DRIVERS.ayilara,
    created_by: STAFF.logisticsOfficer,
    loading: null,
    waybill: null,
    gate_cleared_at: null,
    ...fields,
  };
}

/** Today's tickets, oldest first. Tickets generated in demo mode are added to the end. */
export const tickets: TicketDetail[] = [
  sample({
    ticket_no: "24989001",
    customer: CUSTOMERS.bovas,
    truck: truck("BDJ590XA", "internal"),
    requested_litres: 45000,
    destination_summary: "Akobo 3, 45,000 Litres",
    destinations: [akobo(3, 45000)],
    status: "approved_for_loading",
    inspection: approved("07:40"),
    created_at: at("07:12"),
  }),
  sample({
    ticket_no: "24989002",
    customer: CUSTOMERS.fatgbems,
    truck: truck("BDJ590XA", "industrial"),
    requested_litres: 33000,
    destination_summary: "Babatunde Ishola Filling Station",
    destinations: [babatundeIshola(33000)],
    marketer: marketer("Fatgbems"),
    status: "rejected",
    inspection: rejectedForPpe("07:45"),
    created_at: at("07:15"),
  }),
  sample({
    ticket_no: "24989003",
    customer: CUSTOMERS.connoil,
    truck: truck("BDJ590XA", "industrial"),
    requested_litres: 45000,
    destination_summary: "Akobo 4 (30,000L) / Akobo 3 (15,000L)",
    destinations: [akobo(4, 30000), akobo(3, 15000)],
    marketer: marketer("Connoil"),
    status: "awaiting_safety",
    inspection: null,
    created_at: at("07:20"),
  }),
  sample({
    ticket_no: "24989004",
    customer: CUSTOMERS.bovas,
    truck: truck("BDJ590XA", "internal"),
    requested_litres: 45000,
    destination_summary: "Local",
    destinations: [
      {
        station: "BOVAS Depot, Terminal 1 (local sales)",
        address: "Ibeshe Estate, Ibru Jetty, Apapa, Lagos",
        litres: 45000,
      },
    ],
    status: "approved_for_loading",
    inspection: approved("07:55"),
    created_at: at("07:24"),
  }),
  sample({
    ticket_no: "24989005",
    customer: CUSTOMERS.mrs,
    terminal: TERMINALS.two,
    truck: truck("T245-YA", "industrial"),
    requested_litres: 30000,
    destination_summary: "Babatunde Ishola Filling Station",
    destinations: [babatundeIshola(30000)],
    marketer: marketer("MRS"),
    status: "awaiting_safety",
    inspection: null,
    created_at: at("07:31"),
  }),
  sample({
    ticket_no: "24989006",
    customer: CUSTOMERS.bovas,
    truck: truck("BDJ590XA", "internal"),
    requested_litres: 45000,
    destination_summary: "Akobo 4, 45,000 Litres",
    destinations: [akobo(4, 45000)],
    status: "approved_for_loading",
    inspection: approved("08:02"),
    created_at: at("07:36"),
  }),
  sample({
    ticket_no: "24989007",
    customer: CUSTOMERS.hillCrest,
    truck: truck("BDJ590XA", "marketer"),
    requested_litres: 45000,
    destination_summary: "Babatunde Ishola Filling Station",
    destinations: [babatundeIshola(45000)],
    marketer: marketer("Hill Crest"),
    status: "approved_for_loading",
    inspection: approved("08:10"),
    created_at: at("07:42"),
  }),
  sample({
    ticket_no: "24989008",
    customer: CUSTOMERS.feasiblePath,
    truck: truck("BDJ590XA", "marketer"),
    requested_litres: 45000,
    destination_summary: "Babatunde Ishola Filling Station",
    destinations: [babatundeIshola(45000)],
    marketer: marketer("Feasible Path LTD"),
    status: "approved_for_loading",
    inspection: approved("08:14"),
    created_at: at("07:48"),
  }),
  sample({
    ticket_no: "24989009",
    customer: CUSTOMERS.jotsM,
    terminal: TERMINALS.two,
    truck: truck("BDJ590XA", "marketer"),
    requested_litres: 45000,
    destination_summary: "Babatunde Ishola Filling Station",
    destinations: [babatundeIshola(45000)],
    marketer: marketer("Jots M"),
    status: "approved_for_loading",
    inspection: approved("08:20"),
    created_at: at("07:53"),
  }),
  sample({
    ticket_no: "24989010",
    customer: CUSTOMERS.fatgbems,
    truck: truck("BDJ590XA", "industrial"),
    requested_litres: 45000,
    destination_summary: "Babatunde Ishola Filling Station",
    destinations: [babatundeIshola(45000)],
    marketer: marketer("Fatgbems"),
    status: "rejected",
    inspection: rejectedForPpe("08:25"),
    created_at: at("07:58"),
  }),
];

/** The Logistics demo account, which generates tickets in demo mode. */
const DEMO_OFFICER = { staff_no: "BO014", name: "Olateju Oyetoke" };

/** Loading program row ID → the ticket generated from it in demo mode. */
export const ticketNoByProgramItem = new Map<number, string>();

type Sort = NonNullable<TicketQuery["sort"]>;

function compareBy(sort: Sort) {
  const field = sort.replace(/^-/, "");
  const direction = sort.startsWith("-") ? -1 : 1;

  return (a: TicketDetail, b: TicketDetail) => {
    const order =
      field === "requested_litres"
        ? a.requested_litres - b.requested_litres
        : field === "customer"
          ? a.customer.name.localeCompare(b.customer.name)
          : a.created_at.localeCompare(b.created_at);
    return order * direction;
  };
}

/** The list shape: the detail-only fields are dropped, as the API does. */
function toListItem({
  ticket_no,
  terminal,
  customer,
  truck,
  product,
  requested_litres,
  destination_summary,
  status,
  created_at,
}: TicketDetail): Ticket {
  return {
    ticket_no,
    terminal,
    customer,
    truck,
    product,
    requested_litres,
    destination_summary,
    status,
    created_at,
  };
}

/** `period` and `year` are ignored: every sample ticket is from the same day. */
export async function listTickets(query: TicketQuery = {}): Promise<TicketPage> {
  const matches = tickets
    .filter((ticket) => !query.status || ticket.status === query.status)
    .filter((ticket) => !query.status_group || ticketStatusGroup(ticket.status) === query.status_group)
    .filter((ticket) => !query.truck_type || ticket.truck.type === query.truck_type)
    .filter((ticket) =>
      matchesSearch(
        query.q,
        ticket.ticket_no,
        ticket.customer.name,
        ticket.truck.plate,
        ticket.destination_summary,
      ),
    )
    .sort(compareBy(query.sort ?? "-created_at"))
    .map(toListItem);

  return paginate(matches, query.page, query.per_page);
}

export async function getTicket(ticketNo: string): Promise<TicketDetail | null> {
  return tickets.find((ticket) => ticket.ticket_no === ticketNo) ?? null;
}

/** "Akobo 4" for one destination; "Akobo 4 (30,000L) / Akobo 3 (15,000L)" for several — as the API writes it. */
function destinationSummary(destinations: Destination[]): string {
  return destinations.length === 1
    ? destinations[0].station
    : destinations
        .map((destination) => `${destination.station} (${formatNumber(destination.litres)}L)`)
        .join(" / ");
}

type TicketFields = Omit<TicketInput, "program_item_id">;

/** The API's TicketRules, so demo mode reports the same field errors. */
function checkTicket(fields: TicketFields): void {
  const errors: Record<string, string[]> = {};
  const add = (key: string, message: string) => {
    (errors[key] ??= []).push(message);
  };

  if (!terminalById(fields.terminal_id)) add("terminal_id", "Choose a terminal that exists.");
  if (!customerById(fields.customer_id)) add("customer_id", "Choose a customer that exists.");
  if (!fields.truck_plate?.trim()) add("truck_plate", "Truck plate is required.");
  if (!Number.isInteger(fields.requested_litres) || fields.requested_litres < 1) {
    add("requested_litres", "Requested litres must be at least 1.");
  }
  fields.destinations.forEach((destination, index) => {
    if (!destination.station?.trim()) add(`destinations.${index}.station`, "Station is required.");
    if (!destination.address?.trim()) add(`destinations.${index}.address`, "Address is required.");
    if (!Number.isInteger(destination.litres) || destination.litres < 1) {
      add(`destinations.${index}.litres`, "Litres must be at least 1.");
    }
  });
  if (fields.truck_type !== "internal" && !fields.marketer) {
    add("marketer", "Marketer details are required for marketer and industrial trucks.");
  }

  const allocated = fields.destinations.reduce((sum, destination) => sum + (destination.litres || 0), 0);
  if (allocated !== fields.requested_litres) {
    add(
      "destinations",
      `The destinations add up to ${formatNumber(allocated)} litres, but ${formatNumber(fields.requested_litres || 0)} litres are requested.`,
    );
  }

  if (Object.keys(errors).length > 0) {
    throw new ApiError(422, VALIDATION_MESSAGE, errors);
  }
}

/** Copies checked fields onto a ticket. */
function apply(ticket: TicketDetail, fields: TicketFields): void {
  const terminal = terminalById(fields.terminal_id);
  const customer = customerById(fields.customer_id);
  if (!terminal || !customer) return;

  Object.assign(ticket, {
    terminal,
    customer,
    truck: truck(fields.truck_plate.replace(/\s+/g, "").toUpperCase(), fields.truck_type),
    product: fields.product,
    requested_litres: fields.requested_litres,
    destinations: fields.destinations,
    destination_summary: destinationSummary(fields.destinations),
    driver: fields.driver ?? null,
    marketer: fields.truck_type === "internal" ? null : (fields.marketer ?? null),
  });
}

export async function createTicket(input: TicketInput): Promise<TicketDetail> {
  checkTicket(input);

  const programItemId = input.program_item_id ?? null;
  const existing = programItemId === null ? undefined : ticketNoByProgramItem.get(programItemId);
  if (existing) {
    throw new ApiError(422, VALIDATION_MESSAGE, {
      program_item_id: [`That loading program row already has ticket ${existing}.`],
    });
  }

  const ticket = sample({
    ticket_no: String(Math.max(...tickets.map((current) => Number(current.ticket_no))) + 1),
    customer: CUSTOMERS.bovas,
    truck: truck("", "internal"),
    requested_litres: 0,
    destination_summary: "",
    destinations: [],
    status: "awaiting_safety",
    inspection: null,
    created_at: nowTimestamp(),
    created_by: DEMO_OFFICER,
  });
  apply(ticket, input);
  tickets.push(ticket);
  if (programItemId !== null) ticketNoByProgramItem.set(programItemId, ticket.ticket_no);

  return ticket;
}

export async function updateTicket(ticketNo: string, patch: TicketPatch): Promise<TicketDetail> {
  const ticket = tickets.find((current) => current.ticket_no === ticketNo);
  if (!ticket) {
    throw new ApiError(404, `Ticket ${ticketNo} was not found.`);
  }
  if (ticket.status !== "awaiting_safety") {
    throw new ApiError(409, `Ticket ${ticketNo} can't be edited because Safety has already inspected it.`);
  }

  const fields: TicketFields = {
    terminal_id: patch.terminal_id ?? ticket.terminal.id,
    customer_id: ticket.customer.id,
    truck_plate: patch.truck_plate ?? ticket.truck.plate,
    truck_type: patch.truck_type ?? ticket.truck.type,
    product: patch.product ?? ticket.product,
    requested_litres: patch.requested_litres ?? ticket.requested_litres,
    driver: patch.driver === undefined ? ticket.driver : patch.driver,
    destinations: patch.destinations ?? ticket.destinations,
    marketer: patch.marketer === undefined ? ticket.marketer : patch.marketer,
  };
  checkTicket(fields);
  apply(ticket, fields);

  return ticket;
}
