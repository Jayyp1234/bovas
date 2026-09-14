"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatLitres } from "@/lib/format";
import { matchesQuery } from "@/lib/search";
import { ticketStatusGroup } from "@/domain/labels";
import type { Ticket } from "@/lib/api/types";
import { StatusBadge } from "./status-badge";

const TABS = [
  { key: "all", label: "All" },
  { key: "approved", label: "Approved" },
  { key: "pending", label: "Pending" },
  { key: "failed", label: "Failed" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const COLUMNS = ["Loading Ticket ID", "Customer", "Truck Number", "Product", "Quantity", "Status"];

function matchesTab(ticket: Ticket, tab: TabKey): boolean {
  if (tab === "all") return true;
  const group = ticketStatusGroup(ticket.status);
  return tab === "failed" ? group === "rejected" : group === tab;
}

/** Today's tickets on the dashboard. Filtering and history beyond today live in Ticket History. */
export function LoadingTicketsTable({ tickets }: { tickets: Ticket[] }) {
  const [tab, setTab] = useState<TabKey>("all");
  const [query, setQuery] = useState("");

  const rows = tickets.filter(
    (ticket) =>
      matchesTab(ticket, tab) &&
      matchesQuery(query, ticket.ticket_no, ticket.customer.name, ticket.truck.plate),
  );

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-base font-semibold text-foreground">Today&apos;s Loading Tickets</h3>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tickets…"
            aria-label="Search today's tickets"
            className="h-9 w-48 pl-9 text-xs"
          />
        </div>
      </div>

      <div role="tablist" aria-label="Ticket status" className="flex gap-6 border-b border-border px-5">
        {TABS.map((item) => {
          const active = tab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(item.key)}
              className={cn(
                "-mb-px border-b-2 py-2.5 text-sm font-medium transition-colors",
                active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="overflow-x-auto">
        <ResponsiveTable className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium text-muted-foreground">
              {COLUMNS.map((column) => (
                <th key={column} className="px-5 py-3 font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((ticket) => (
              <tr key={ticket.ticket_no} className="border-b border-border transition-colors last:border-0 hover:bg-muted/50">
                <td className="px-5 py-3.5 font-medium text-foreground">
                  <Link href={`/ticket-history/${ticket.ticket_no}`} className="transition-colors hover:text-primary">
                    {ticket.ticket_no}
                  </Link>
                </td>
                <td className="px-5 py-3.5 text-muted-foreground">{ticket.customer.name}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{ticket.truck.plate}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{ticket.product}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{formatLitres(ticket.requested_litres)}</td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={ticket.status} />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-5 py-12 text-center text-sm text-muted-foreground">
                  {tickets.length === 0 ? "No tickets have been generated today." : "No tickets match your filters."}
                </td>
              </tr>
            )}
          </tbody>
        </ResponsiveTable>
      </div>

      <div className="flex flex-col gap-2 border-t border-border px-5 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>
          Showing {rows.length} of {tickets.length} tickets generated today
        </span>
        <Link href="/ticket-history" className="font-medium text-foreground underline-offset-4 hover:underline">
          View all in Ticket History
        </Link>
      </div>
    </Card>
  );
}
