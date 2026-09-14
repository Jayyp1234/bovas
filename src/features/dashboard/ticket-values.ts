/**
 * The ticket form's values and how they map to and from the API. Shared by the Generate Ticket
 * page (server) and the form (client).
 */
import { TRUCK_TYPE_LABEL } from "@/domain/labels";
import { formatDepotDate, formatDepotTime, formatLitres, formatNumber } from "@/lib/format";
import type {
  Customer,
  Product,
  ProgramItem,
  TicketDetail,
  TicketInput,
  TicketPatch,
  TruckType,
} from "@/lib/api/types";
import type { TicketPreviewData } from "./components/ticket-preview-panel";

export const PRODUCT_LABEL: Record<Product, string> = {
  PMS: "PMS",
  AGO: "AGO (Diesel)",
  DPK: "DPK",
};

export const PRODUCTS = Object.keys(PRODUCT_LABEL) as Product[];

export interface DestinationValues {
  station: string;
  address: string;
  litres: string;
}

/** What the form edits. Litres are text so people can type "45,000". */
export interface TicketFormValues {
  terminalId: number;
  customerId: number | null;
  truckType: TruckType;
  truckPlate: string;
  product: Product;
  requestedLitres: string;
  driverName: string;
  driverPhone: string;
  destinations: DestinationValues[];
  marketerName: string;
  representative: string;
  marketerPhone: string;
}

const EMPTY_DESTINATION: DestinationValues = { station: "", address: "", litres: "" };

/** "45,000", "45000" or "45,000 Litres" → 45000; anything else → NaN. */
export function toLitres(value: string): number {
  const digits = value.replace(/litres?/i, "").replace(/[,\s]/g, "");
  return /^\d+$/.test(digits) ? Number(digits) : Number.NaN;
}

function litresText(litres: number): string {
  return formatNumber(litres);
}

export function emptyValues(terminalId: number): TicketFormValues {
  return {
    terminalId,
    customerId: null,
    truckType: "internal",
    truckPlate: "",
    product: "PMS",
    requestedLitres: "",
    driverName: "",
    driverPhone: "",
    destinations: [{ ...EMPTY_DESTINATION }],
    marketerName: "",
    representative: "",
    marketerPhone: "",
  };
}

/** Starts a ticket from a loading program row, with the customer's marketer contact filled in. */
export function valuesFromProgramItem(
  item: ProgramItem,
  customers: Customer[],
  terminalId: number,
): TicketFormValues {
  const customer = customers.find((option) => option.id === item.customer.id);

  return {
    ...emptyValues(terminalId),
    customerId: item.customer.id,
    truckType: item.truck.type,
    truckPlate: item.truck.plate,
    product: item.product,
    requestedLitres: litresText(item.quantity_litres),
    destinations: [{ station: item.destination, address: "", litres: litresText(item.quantity_litres) }],
    marketerName: item.truck.type === "internal" ? "" : item.customer.name,
    representative: customer?.representative ?? "",
    marketerPhone: customer?.phone ?? "",
  };
}

export function valuesFromTicket(ticket: TicketDetail): TicketFormValues {
  return {
    terminalId: ticket.terminal.id,
    customerId: ticket.customer.id,
    truckType: ticket.truck.type,
    truckPlate: ticket.truck.plate,
    product: ticket.product,
    requestedLitres: litresText(ticket.requested_litres),
    driverName: ticket.driver?.name ?? "",
    driverPhone: ticket.driver?.phone ?? "",
    destinations: ticket.destinations.map((destination) => ({
      station: destination.station,
      address: destination.address,
      litres: litresText(destination.litres),
    })),
    marketerName: ticket.marketer?.name ?? "",
    representative: ticket.marketer?.representative ?? "",
    marketerPhone: ticket.marketer?.phone ?? "",
  };
}

export function toTicketInput(values: TicketFormValues, programItemId?: number): TicketInput {
  const hasDriver = values.driverName.trim() !== "" || values.driverPhone.trim() !== "";

  return {
    program_item_id: programItemId ?? null,
    terminal_id: values.terminalId,
    customer_id: values.customerId ?? 0,
    truck_plate: values.truckPlate.trim(),
    truck_type: values.truckType,
    product: values.product,
    requested_litres: toLitres(values.requestedLitres),
    driver: hasDriver ? { name: values.driverName.trim(), phone: values.driverPhone.trim() } : null,
    destinations: values.destinations.map((destination) => ({
      station: destination.station.trim(),
      address: destination.address.trim(),
      litres: toLitres(destination.litres),
    })),
    marketer:
      values.truckType === "internal"
        ? null
        : {
            name: values.marketerName.trim(),
            representative: values.representative.trim(),
            phone: values.marketerPhone.trim(),
          },
  };
}

/** An edit sends everything the API lets Logistics change; the customer and program row are fixed. */
export function toTicketPatch(input: TicketInput): TicketPatch {
  return {
    terminal_id: input.terminal_id,
    truck_plate: input.truck_plate,
    truck_type: input.truck_type,
    product: input.product,
    requested_litres: input.requested_litres,
    driver: input.driver,
    destinations: input.destinations,
    marketer: input.marketer,
  };
}

/**
 * Checks what can be checked before the preview, with the API's field keys and wording. The API
 * checks everything again when the ticket is saved.
 */
export function checkValues(values: TicketFormValues): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  const add = (key: string, message: string) => {
    (errors[key] ??= []).push(message);
  };

  if (values.customerId === null) add("customer_id", "Choose the customer.");
  if (!values.truckPlate.trim()) add("truck_plate", "Enter the truck number.");

  const requested = toLitres(values.requestedLitres);
  if (!(requested >= 1)) add("requested_litres", "Enter the litres requested, e.g. 45,000.");

  values.destinations.forEach((destination, index) => {
    if (!destination.station.trim()) add(`destinations.${index}.station`, "Enter the station.");
    if (!destination.address.trim()) add(`destinations.${index}.address`, "Enter the address.");
    if (!(toLitres(destination.litres) >= 1)) add(`destinations.${index}.litres`, "Enter the litres for this station.");
  });

  const allocated = allocatedLitres(values);
  if (requested >= 1 && allocated !== requested) {
    add(
      "destinations",
      `The destinations add up to ${formatNumber(allocated)} litres, but ${formatNumber(requested)} litres are requested.`,
    );
  }

  if (values.truckType !== "internal") {
    if (!values.marketerName.trim()) add("marketer.name", "Enter the marketer.");
    if (!values.representative.trim()) add("marketer.representative", "Enter the representative.");
    if (!values.marketerPhone.trim()) add("marketer.phone", "Enter the phone number.");
  }

  return errors;
}

/** Litres across the destinations, ignoring ones not filled in yet. */
export function allocatedLitres(values: TicketFormValues): number {
  return values.destinations.reduce((sum, destination) => sum + (toLitres(destination.litres) || 0), 0);
}

/** The letterhead preview of a ticket that hasn't been saved yet. */
export function draftPreview(
  values: TicketFormValues,
  meta: Pick<TicketPreviewData, "ticketId" | "date" | "time" | "depot">,
): TicketPreviewData {
  const marketer = values.truckType !== "internal";

  return {
    ...meta,
    truckType: TRUCK_TYPE_LABEL[values.truckType],
    truckNumber: values.truckPlate.replace(/\s+/g, "").toUpperCase(),
    product: PRODUCT_LABEL[values.product],
    requestedAmount: formatLitres(toLitres(values.requestedLitres)),
    destinations: values.destinations.map((destination) => ({
      station: destination.station.trim(),
      address: destination.address.trim(),
      quantity: formatLitres(toLitres(destination.litres)),
    })),
    marketer: marketer ? values.marketerName.trim() : "",
    representative: marketer ? values.representative.trim() : "",
    phoneNumber: marketer ? values.marketerPhone.trim() : "",
  };
}

/** The letterhead of an issued ticket. */
export function issuedPreview(ticket: TicketDetail): TicketPreviewData {
  return {
    ticketId: ticket.ticket_no,
    date: formatDepotDate(ticket.created_at),
    time: formatDepotTime(ticket.created_at),
    depot: ticket.terminal.name,
    truckType: TRUCK_TYPE_LABEL[ticket.truck.type],
    truckNumber: ticket.truck.plate,
    product: PRODUCT_LABEL[ticket.product],
    requestedAmount: formatLitres(ticket.requested_litres),
    destinations: ticket.destinations.map((destination) => ({
      station: destination.station,
      address: destination.address,
      quantity: formatLitres(destination.litres),
    })),
    marketer: ticket.marketer?.name ?? "",
    representative: ticket.marketer?.representative ?? "",
    phoneNumber: ticket.marketer?.phone ?? "",
  };
}
