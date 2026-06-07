"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Download,
  ChevronDown,
  FileText,
  Sheet,
  MoreHorizontal,
  Eye,
  Printer,
} from "lucide-react";
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

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const ARCHIVE_YEARS = ["2025", "2024", "2023", "2022"];

const COLUMNS = [
  "Loading Ticket ID",
  "Customer",
  "Truck Type",
  "Truck Number",
  "Product",
  "Quantity Requested",
  "Destination",
];

const controlSelect =
  "h-9 rounded-lg border border-border bg-surface px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";

const menuItem =
  "flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted";

function matchesFilter(ticket: LoadingTicket, filter: FilterKey) {
  if (filter === "All") return true;
  return ticket.truckType === filter;
}

export function TicketHistoryTable() {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterKey>("All");
  const [query, setQuery] = useState("");
  const [exportOpen, setExportOpen] = useState(false);
  const [openRow, setOpenRow] = useState<string | null>(null);

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
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Loading Ticket History
          </h3>
          <p className="text-sm text-muted-foreground">
            Overview of today&apos;s loading activities.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm">
            This Week
          </Button>
          <select className={controlSelect} defaultValue="2026" aria-label="Month">
            <option value="2026">2026</option>
            {MONTHS.map((month) => (
              <option key={month}>{month}</option>
            ))}
          </select>
          <select className={controlSelect} defaultValue="" aria-label="Archive">
            <option value="" disabled hidden>
              Archive
            </option>
            {ARCHIVE_YEARS.map((year) => (
              <option key={year}>{year}</option>
            ))}
          </select>
          <div className="relative">
            <Button
              size="sm"
              onClick={() => setExportOpen((value) => !value)}
              aria-expanded={exportOpen}
            >
              <Download className="size-4" />
              Export
              <ChevronDown className="size-3.5" />
            </Button>
            {exportOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setExportOpen(false)}
                  aria-hidden
                />
                <div className="absolute right-0 top-10 z-50 w-44 overflow-hidden rounded-lg border border-border bg-surface py-1 shadow-lg">
                  <button
                    type="button"
                    onClick={() => setExportOpen(false)}
                    className={menuItem}
                  >
                    <FileText className="size-4 text-muted-foreground" />
                    Export as PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportOpen(false)}
                    className={menuItem}
                  >
                    <Sheet className="size-4 text-muted-foreground" />
                    Export as Sheet
                  </button>
                </div>
              </>
            )}
          </div>
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
        <table className="w-full min-w-[880px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium text-muted-foreground">
              <th className="w-10 px-5 py-3 font-medium">
                <span className="sr-only">Select</span>
              </th>
              {COLUMNS.map((column) => (
                <th key={column} className="px-5 py-3 font-medium">
                  {column}
                </th>
              ))}
              <th className="w-12 px-5 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((ticket) => (
              <tr
                key={ticket.id}
                className="border-b border-border transition-colors last:border-0 hover:bg-muted/50"
              >
                <td className="px-5 py-3.5">
                  <Checkbox id={`ticket-${ticket.id}`} />
                </td>
                <td className="px-5 py-3.5 font-medium text-foreground">
                  {ticket.id}
                </td>
                <td className="px-5 py-3.5 text-muted-foreground">
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
                  <div className="relative inline-block">
                    <button
                      type="button"
                      aria-label={`Actions for ticket ${ticket.id}`}
                      onClick={() =>
                        setOpenRow(openRow === ticket.id ? null : ticket.id)
                      }
                      className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
                    >
                      <MoreHorizontal className="size-4" />
                    </button>
                    {openRow === ticket.id && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setOpenRow(null)}
                          aria-hidden
                        />
                        <div className="absolute right-0 top-9 z-50 w-44 overflow-hidden rounded-lg border border-border bg-surface py-1 shadow-lg">
                          <button
                            type="button"
                            onClick={() => {
                              setOpenRow(null);
                              router.push(`/ticket-history/${ticket.id}`);
                            }}
                            className={menuItem}
                          >
                            <Eye className="size-4 text-muted-foreground" />
                            View Ticket
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOpenRow(null);
                              window.print();
                            }}
                            className={menuItem}
                          >
                            <Printer className="size-4 text-muted-foreground" />
                            Print Ticket
                          </button>
                          <button
                            type="button"
                            onClick={() => setOpenRow(null)}
                            className={menuItem}
                          >
                            <Download className="size-4 text-muted-foreground" />
                            Download Ticket
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={COLUMNS.length + 2}
                  className="px-5 py-12 text-center text-sm text-muted-foreground"
                >
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
          <span className="ml-2 font-semibold text-foreground">
            {formatNumber(totalLitres)} Litres
          </span>
        </p>
        <p className="text-sm text-muted-foreground">
          Showing {rows.length} of {loadingTickets.length} loaded tickets
        </p>
      </div>
    </Card>
  );
}
