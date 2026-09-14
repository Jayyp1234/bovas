import type { Metadata } from "next";
import { TicketHistoryTable } from "@/features/dashboard/components/ticket-history-table";
import { TICKET_SORTS, TRUCK_TYPES } from "@/domain/labels";
import { listTickets } from "@/lib/api/tickets";
import { archiveYears, intParam, oneOfParam, textParam, timeParams, type SearchParams } from "@/lib/search-params";

export const metadata: Metadata = { title: "Ticket History" };

export default async function TicketHistoryPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const tickets = await listTickets({
    ...timeParams(params),
    truck_type: oneOfParam(params, "truck_type", TRUCK_TYPES),
    q: textParam(params, "q"),
    sort: oneOfParam(params, "sort", TICKET_SORTS) ?? "-created_at",
    page: intParam(params, "page"),
    per_page: 20,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <TicketHistoryTable tickets={tickets.data} meta={tickets.meta} years={archiveYears()} />
    </div>
  );
}
