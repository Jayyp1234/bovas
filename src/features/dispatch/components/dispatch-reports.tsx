"use client";

import { useState } from "react";
import {
  Search,
  ArrowUpDown,
  SlidersHorizontal,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Sheet,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatLitres } from "@/lib/format";
import { waybills, dispatchReportTotals } from "../data/waybills";
import type { TruckType, Waybill } from "../data/waybills";

const FILTERS = ["All", "Internal", "Marketer", "Industrial"] as const;
type FilterKey = (typeof FILTERS)[number];

const COLUMNS = [
  "Loading Ticket ID",
  "Waybill ID",
  "Customer",
  "Truck Type",
  "Truck Number",
  "Product",
  "Requested Quantity",
];

const toolbarButton =
  "inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted";

function matchesFilter(item: Waybill, filter: FilterKey) {
  if (filter === "All") return true;
  return item.truckType === (filter as TruckType);
}

export function DispatchReports() {
  const [filter, setFilter] = useState<FilterKey>("All");
  const [query, setQuery] = useState("");
  const [exportOpen, setExportOpen] = useState(false);

  const rows = waybills.filter((item) => {
    if (!matchesFilter(item, filter)) return false;
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return (
      item.id.toLowerCase().includes(q) ||
      item.loadingTicketId.includes(q) ||
      item.customer.toLowerCase().includes(q) ||
      item.truckNumber.toLowerCase().includes(q)
    );
  });

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Activity Reports
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of today&apos;s loading activities
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-sm text-muted-foreground">Total Amount Requested</p>
          <p className="mt-3 text-3xl font-bold text-foreground">
            {formatLitres(dispatchReportTotals.totalRequested)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Last generated 14:06
          </p>
        </div>
        <div className="rounded-2xl border border-success/20 bg-success-surface/60 p-5">
          <p className="text-sm text-muted-foreground">Total Amount Loaded</p>
          <p className="mt-3 text-3xl font-bold text-success">
            {formatLitres(dispatchReportTotals.totalLoaded)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Last generated 14:06
          </p>
        </div>
        <div className="rounded-2xl border border-danger/20 bg-danger-surface/60 p-5">
          <p className="text-sm text-muted-foreground">Variance</p>
          <p className="mt-3 text-3xl font-bold text-danger">
            +{formatLitres(dispatchReportTotals.variance)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Last generated 14:06
          </p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border px-5 pt-2">
          <div className="relative mr-auto py-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Tickets"
              aria-label="Search waybills"
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

        <div className="flex flex-wrap items-center justify-end gap-2 border-b border-border p-4">
          <button type="button" className={toolbarButton}>
            Sort
            <ArrowUpDown className="size-3.5" />
          </button>
          <button type="button" className={toolbarButton}>
            Filter
            <SlidersHorizontal className="size-3.5" />
          </button>
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
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    <FileText className="size-4 text-muted-foreground" />
                    Export as PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportOpen(false)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    <Sheet className="size-4 text-muted-foreground" />
                    Export as Sheet
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
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
              {rows.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-border transition-colors last:border-0 hover:bg-muted/50"
                >
                  <td className="px-5 py-3.5 font-medium text-foreground">
                    {item.loadingTicketId}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {item.id}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {item.customer}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {item.truckType}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {item.truckNumber}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {item.product}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {formatLitres(item.requestedQuantity)}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={COLUMNS.length}
                    className="px-5 py-12 text-center text-sm text-muted-foreground"
                  >
                    No waybills match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border p-5 text-sm text-muted-foreground">
          <button
            type="button"
            className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            Previous
          </button>
          <span>
            Showing 1–{rows.length} of {waybills.length} Loaded trucks
          </span>
          <button
            type="button"
            className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
          >
            Next
            <ChevronRight className="size-4" />
          </button>
        </div>
      </Card>
    </div>
  );
}
