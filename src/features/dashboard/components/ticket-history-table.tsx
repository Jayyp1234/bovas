"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Eye, MoreHorizontal, Printer } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { Pagination, ParamSelect, ParamTabs, PeriodFilter, SearchInput } from "@/components/ui/table-controls";
import { useToast } from "@/components/ui/toaster";
import { TICKET_SORT_OPTIONS, TRUCK_TYPE_FILTERS, TRUCK_TYPE_LABEL } from "@/domain/labels";
import { formatDepotDate, formatDepotTime, formatLitres } from "@/lib/format";
import { useUrlParams } from "@/lib/use-url-params";
import type { PaginationMeta, Ticket } from "@/lib/api/types";
import { StatusBadge } from "./status-badge";

const COLUMNS = [
  "Loading Ticket ID",
  "Generated",
  "Customer",
  "Truck Type",
  "Truck Number",
  "Product",
  "Quantity Requested",
  "Destination",
  "Status",
];

const menuItem =
  "flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted";

interface TicketHistoryTableProps {
  tickets: Ticket[];
  meta: PaginationMeta;
  /** Past years for the Archive menu. */
  years: number[];
}

export function TicketHistoryTable({ tickets, meta, years }: TicketHistoryTableProps) {
  const router = useRouter();
  const toast = useToast();
  const { query } = useUrlParams();
  const [openRow, setOpenRow] = useState<string | null>(null);

  function open(path: string) {
    setOpenRow(null);
    router.push(path);
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">Loading Ticket History</h3>
          <p className="text-sm text-muted-foreground">Every ticket generated, with where it is now.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PeriodFilter years={years} />
          <a
            href={`/download/ticket-history${query ? `?${query}` : ""}`}
            onClick={() => toast("Ticket history exported.")}
            className={buttonVariants({ size: "sm" })}
          >
            <Download className="size-4" />
            Export CSV
          </a>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-b border-border px-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 pt-3 sm:py-3">
          <SearchInput placeholder="Search tickets…" label="Search tickets" className="w-56" />
          <ParamSelect param="sort" label="Sort tickets" kind="sort" options={TICKET_SORT_OPTIONS} defaultValue="-created_at" />
        </div>
        <ParamTabs param="truck_type" label="Truck type" tabs={TRUCK_TYPE_FILTERS} />
      </div>

      <div className="overflow-x-auto">
        <ResponsiveTable className="w-full min-w-[1080px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium text-muted-foreground">
              {COLUMNS.map((column) => (
                <th key={column} className="px-5 py-3 font-medium">
                  {column}
                </th>
              ))}
              <th className="w-12 px-5 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.ticket_no} className="border-b border-border transition-colors last:border-0 hover:bg-muted/50">
                <td className="px-5 py-3.5 font-medium text-foreground">{ticket.ticket_no}</td>
                <td className="px-5 py-3.5 text-muted-foreground">
                  {formatDepotTime(ticket.created_at)}
                  <span className="block text-xs">{formatDepotDate(ticket.created_at)}</span>
                </td>
                <td className="px-5 py-3.5 text-muted-foreground">{ticket.customer.name}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{TRUCK_TYPE_LABEL[ticket.truck.type]}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{ticket.truck.plate}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{ticket.product}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{formatLitres(ticket.requested_litres)}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{ticket.destination_summary}</td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={ticket.status} />
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="relative inline-block">
                    <button
                      type="button"
                      aria-label={`Actions for ticket ${ticket.ticket_no}`}
                      aria-expanded={openRow === ticket.ticket_no}
                      onClick={() => setOpenRow(openRow === ticket.ticket_no ? null : ticket.ticket_no)}
                      className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
                    >
                      <MoreHorizontal className="size-4" />
                    </button>
                    {openRow === ticket.ticket_no && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setOpenRow(null)} aria-hidden />
                        <div className="absolute right-0 top-9 z-50 w-44 overflow-hidden rounded-lg border border-border bg-surface py-1 shadow-lg">
                          <button type="button" onClick={() => open(`/ticket-history/${ticket.ticket_no}`)} className={menuItem}>
                            <Eye className="size-4 text-muted-foreground" />
                            View Details
                          </button>
                          <button type="button" onClick={() => open(`/ticket-preview?ticket=${ticket.ticket_no}`)} className={menuItem}>
                            <Printer className="size-4 text-muted-foreground" />
                            Print Ticket
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length + 1} className="px-5 py-12 text-center text-sm text-muted-foreground">
                  No tickets match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </ResponsiveTable>
      </div>

      <Pagination page={meta.page} perPage={meta.per_page} total={meta.total} noun="tickets" />
    </Card>
  );
}
