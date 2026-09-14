import type { NextRequest } from "next/server";
import { TICKET_SORTS, TICKET_STATUS_LABEL, TRUCK_TYPES, TRUCK_TYPE_LABEL } from "@/domain/labels";
import { allPages } from "@/lib/api/pages";
import { listTickets } from "@/lib/api/tickets";
import { requireRole } from "@/lib/auth/current-user";
import { csvDownload, depotIsoDate, scopeLabel, toCsv } from "@/lib/csv";
import { formatDepotTime } from "@/lib/format";
import { oneOfParam, textParam, timeParams } from "@/lib/search-params";

/** `/download/ticket-history?…` — every ticket matching the Ticket History filters, as a CSV. */
export async function GET(request: NextRequest) {
  await requireRole("logistics");
  const params = Object.fromEntries(request.nextUrl.searchParams);
  const time = timeParams(params);
  const filters = {
    ...time,
    truck_type: oneOfParam(params, "truck_type", TRUCK_TYPES),
    q: textParam(params, "q"),
    sort: oneOfParam(params, "sort", TICKET_SORTS),
  };

  const tickets = await allPages((page, perPage) => listTickets({ ...filters, page, per_page: perPage }));
  const csv = toCsv([
    ["Loading Ticket ID", "Date", "Time", "Customer", "Truck Type", "Truck Number", "Product", "Requested Litres", "Destination", "Status"],
    ...tickets.map((ticket) => [
      ticket.ticket_no,
      depotIsoDate(ticket.created_at),
      formatDepotTime(ticket.created_at),
      ticket.customer.name,
      TRUCK_TYPE_LABEL[ticket.truck.type],
      ticket.truck.plate,
      ticket.product,
      ticket.requested_litres,
      ticket.destination_summary,
      TICKET_STATUS_LABEL[ticket.status],
    ]),
  ]);

  return csvDownload(`bovas-ticket-history-${scopeLabel(time)}-${depotIsoDate()}.csv`, csv);
}
