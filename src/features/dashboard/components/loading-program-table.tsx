"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowUpDown,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatLitres } from "@/lib/format";
import { loadingTickets } from "../data/tickets";
import type { LoadingTicket } from "../types";

const FILTERS = ["All", "Internal", "Marketer", "Industrial"] as const;
type FilterKey = (typeof FILTERS)[number];

const COLUMNS = [
  "Customer",
  "Truck Type",
  "Truck Number",
  "Product",
  "Quantity Requested",
  "Destination",
];

const toolbarButton =
  "inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted";

function matchesFilter(ticket: LoadingTicket, filter: FilterKey) {
  if (filter === "All") return true;
  return ticket.truckType === filter;
}

export function LoadingProgramTable() {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterKey>("All");
  const [query, setQuery] = useState("");

  const rows = loadingTickets.filter((ticket) => {
    if (!matchesFilter(ticket, filter)) return false;
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return (
      ticket.customer.toLowerCase().includes(q) ||
      ticket.truckNumber.toLowerCase().includes(q) ||
      ticket.destination.toLowerCase().includes(q)
    );
  });

  function startTicket(ticket: LoadingTicket) {
    const params = new URLSearchParams({
      truckType: ticket.truckType,
      truckNumber: ticket.truckNumber,
      product: ticket.product,
      quantity: String(ticket.quantity),
      customer: ticket.customer,
    });
    router.push(`/generate-ticket?${params.toString()}`);
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Loading Program
          </h3>
          <p className="text-sm text-muted-foreground">
            Review loading ticket assignments and dispatch schedules.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={toolbarButton}>
            Sort
            <ArrowUpDown className="size-3.5" />
          </button>
          <button type="button" className={toolbarButton}>
            Filter
            <SlidersHorizontal className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-border px-5">
        <div className="relative mr-auto py-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tickets…"
            aria-label="Search tickets"
            className="h-9 w-44 pl-9 text-xs"
          />
        </div>
        {FILTERS.map((item) => {
          const active = filter === item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={cn(
                "-mb-px border-b-2 px-1 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {item}
            </button>
          );
        })}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium text-muted-foreground">
              {COLUMNS.map((column) => (
                <th key={column} className="px-5 py-3 font-medium">
                  {column}
                </th>
              ))}
              <th className="px-5 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((ticket) => (
              <tr
                key={ticket.id}
                className="border-b border-border transition-colors last:border-0 hover:bg-muted/50"
              >
                <td className="px-5 py-3.5 font-medium text-foreground">
                  {ticket.customer}
                </td>
                <td className="px-5 py-3.5 text-muted-foreground">
                  {ticket.truckType}
                </td>
                <td className="px-5 py-3.5 text-muted-foreground">
                  {ticket.truckNumber}
                </td>
                <td className="px-5 py-3.5 text-muted-foreground">
                  {ticket.product}
                </td>
                <td className="px-5 py-3.5 text-muted-foreground">
                  {formatLitres(ticket.quantity)}
                </td>
                <td className="px-5 py-3.5 text-muted-foreground">
                  {ticket.destination}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Button size="sm" onClick={() => startTicket(ticket)}>
                    Start Ticket
                  </Button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={COLUMNS.length + 1}
                  className="px-5 py-12 text-center text-sm text-muted-foreground"
                >
                  No tickets match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3 p-4">
        <p className="text-sm text-muted-foreground">
          Showing {rows.length} ticket(s).
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous page"
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
          >
            <ChevronLeft className="size-4" />
          </button>
          {[1, 2, 3, 4].map((page) => (
            <button
              key={page}
              type="button"
              aria-current={page === 1 ? "page" : undefined}
              className={cn(
                "size-8 rounded-md text-sm transition-colors",
                page === 1
                  ? "bg-primary font-semibold text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            aria-label="Next page"
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
