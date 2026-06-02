"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowUpDown, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
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

export function LoadingProgramTable() {
  const router = useRouter();
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

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">Loading Program</h3>
          <p className="text-sm text-muted-foreground">
            Review loading ticket assignments and dispatch schedules.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" onClick={() => router.push("/ticket-preview") }>
            Preview Ticket
          </Button>
          <Button variant="outline" size="sm">
            Sort
            <ArrowUpDown className="size-4" />
          </Button>
          <Button variant="outline" size="sm">
            Filter
            <SlidersHorizontal className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-y border-border px-5 py-4">
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
                <td className="px-5 py-3.5 font-medium text-foreground">
                  <Link href={`/ticket-history/${ticket.id}`} className="transition-colors hover:text-primary">
                    {ticket.id}
                  </Link>
                </td>
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
                <td colSpan={COLUMNS.length} className="px-5 py-12 text-center text-sm text-muted-foreground">
                  No tickets match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3 p-4">
        <p className="text-sm text-muted-foreground">Showing {rows.length} ticket(s).</p>
        <div className="flex items-center gap-1">
          <button type="button" className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted">
            <ChevronLeft className="size-4" />
          </button>
          {[1, 2, 3, 4].map((page) => (
            <button
              key={page}
              type="button"
              className={cn(
                "size-8 rounded-md text-sm transition-colors",
                page === 1 ? "bg-primary font-semibold text-primary-foreground" : "text-muted-foreground hover:bg-muted",
              )}
            >
              {page}
            </button>
          ))}
          <button type="button" className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted">
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
