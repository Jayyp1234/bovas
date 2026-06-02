"use client";

import { useState } from "react";
import { Search, ArrowUpDown, SlidersHorizontal, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatLitres, formatNumber } from "@/lib/format";
import { loadingTickets } from "../data/tickets";
import type { LoadingTicket } from "../types";

const FILTERS = ["All", "Internal", "Marketer", "Industrial"] as const;

type FilterKey = (typeof FILTERS)[number];

const COLUMNS = [
  "Loading Ticket ID",
  "Customer",
  "Truck Type",
  "Truck Number",
  "Product",
  "Quantity Requested",
  "Destination",
];

function matchesFilter(ticket: LoadingTicket, filter: FilterKey) {
  if (filter === "All") return true;
  return ticket.truckType === filter;
}

export function TicketHistoryTable() {
  const [filter, setFilter] = useState<FilterKey>("All");
  const [query, setQuery] = useState("");

  const rows = loadingTickets.filter((ticket) => {
    if (!matchesFilter(ticket, filter)) return false;
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return (
      ticket.id.includes(q) ||
      ticket.customer.toLowerCase().includes(q) ||
      ticket.truckNumber.toLowerCase().includes(q) ||
      ticket.destination.toLowerCase().includes(q)
    );
  });

  const totalLitres = rows.reduce((sum, ticket) => sum + ticket.quantity, 0);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">Loading Ticket History</h3>
          <p className="text-sm text-muted-foreground">
            Overview of today&apos;s loading activities.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            This Week
          </Button>
          <select className="h-9 rounded-full border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
            <option>2026</option>
            <option>2025</option>
            <option>2024</option>
          </select>
          <Button variant="outline" size="sm">
            Archive
          </Button>
          <Button variant="secondary" size="sm">
            <Download className="size-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-y border-border px-5 py-4">
        {FILTERS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-medium transition-colors",
              filter === item
                ? "bg-primary text-primary-foreground"
                : "bg-surface text-muted-foreground hover:bg-muted",
            )}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
              <th className="px-5 py-3 font-medium"> </th>
              {COLUMNS.map((column) => (
                <th key={column} className="px-5 py-3 font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((ticket) => (
              <tr key={ticket.id} className="border-b border-border transition-colors last:border-0 hover:bg-muted/50">
                <td className="px-5 py-3.5">
                  <Checkbox id={`ticket-${ticket.id}`} />
                </td>
                <td className="px-5 py-3.5 font-medium text-foreground">{ticket.id}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{ticket.customer}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{ticket.truckType}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{ticket.truckNumber}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{ticket.product}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{formatLitres(ticket.quantity)}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{ticket.destination}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length + 1} className="px-5 py-12 text-center text-sm text-muted-foreground">
                  No ticket history entries match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Total Amount Requested:
          <span className="ml-2 font-semibold text-foreground">{formatNumber(totalLitres)} Litres</span>
        </p>
        <p className="text-sm text-muted-foreground">Showing {rows.length} of {loadingTickets.length} loaded tickets</p>
      </div>
    </Card>
  );
}
