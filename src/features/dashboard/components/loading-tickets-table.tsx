"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  ArrowUpDown,
  SlidersHorizontal,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatLitres } from "@/lib/format";
import { StatusBadge } from "./status-badge";
import { loadingTickets } from "../data/tickets";
import type { LoadingTicket, TicketStatus } from "../types";

const TABS = [
  { key: "all", label: "All" },
  { key: "approved", label: "Approved" },
  { key: "pending", label: "Pending" },
  { key: "failed", label: "Failed" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const COLUMNS = [
  "Loading Ticket ID",
  "Customer",
  "Truck Number",
  "Product",
  "Quantity",
  "Status",
];

const toolbarButton =
  "inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted";

function matchesTab(ticket: LoadingTicket, tab: TabKey): boolean {
  if (tab === "all") return true;
  if (tab === "failed") return ticket.status === "rejected";
  return ticket.status === (tab as TicketStatus);
}

export function LoadingTicketsTable() {
  const [tab, setTab] = useState<TabKey>("all");
  const [query, setQuery] = useState("");

  const rows = loadingTickets.filter((ticket) => {
    if (!matchesTab(ticket, tab)) return false;
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return (
      ticket.id.includes(q) ||
      ticket.customer.toLowerCase().includes(q) ||
      ticket.truckNumber.toLowerCase().includes(q)
    );
  });

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-base font-semibold text-foreground">
          Today&apos;s Loading Tickets
        </h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tickets…"
              aria-label="Search tickets"
              className="h-9 w-40 pl-9 text-xs sm:w-48"
            />
          </div>
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

      <div
        role="tablist"
        aria-label="Ticket status"
        className="flex gap-6 border-b border-border px-5"
      >
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
                active
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          );
        })}
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
              <th className="w-12 px-5 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((ticket) => (
              <tr
                key={ticket.id}
                className="border-b border-border transition-colors last:border-0 hover:bg-muted/50"
              >
                <td className="px-5 py-3.5 font-medium text-foreground">
                  <Link
                    href={`/ticket-history/${ticket.id}`}
                    className="transition-colors hover:text-primary"
                  >
                    {ticket.id}
                  </Link>
                </td>
                <td className="px-5 py-3.5 text-muted-foreground">
                  {ticket.customer}
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
                <td className="px-5 py-3.5">
                  <StatusBadge status={ticket.status} />
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link
                    href={`/ticket-history/${ticket.id}`}
                    aria-label={`View ticket ${ticket.id}`}
                    className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
                  >
                    <MoreHorizontal className="size-4" />
                  </Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={COLUMNS.length + 1}
                  className="px-5 py-12 text-center text-sm text-muted-foreground"
                >
                  No tickets match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-center gap-1 p-4">
        <button
          type="button"
          aria-label="Previous page"
          className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
        >
          <ChevronLeft className="size-4" />
        </button>
        {[1, 2, 3, 4, 5].map((page) => (
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
    </Card>
  );
}
