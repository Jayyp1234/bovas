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
import { dispatchQueue } from "../data/waybills";
import type { DispatchQueueItem, TruckType } from "../data/waybills";

const TABS = [
  { key: "all", label: "All" },
  { key: "Internal", label: "Internal" },
  { key: "Marketer", label: "Marketer" },
  { key: "Industrial", label: "Industrial" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const COLUMNS = [
  "Loading Ticket ID",
  "Customer",
  "Truck Type",
  "Truck Number",
  "Product",
  "Quantity Requested",
  "Destination",
];

const toolbarButton =
  "inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted";

function matchesTab(item: DispatchQueueItem, tab: TabKey) {
  if (tab === "all") return true;
  return item.truckType === (tab as TruckType);
}

export function DispatchQueue() {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("all");
  const [query, setQuery] = useState("");

  const rows = dispatchQueue.filter((item) => {
    if (!matchesTab(item, tab)) return false;
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return (
      item.loadingTicketId.includes(q) ||
      item.customer.toLowerCase().includes(q) ||
      item.truckNumber.toLowerCase().includes(q) ||
      item.destination.toLowerCase().includes(q)
    );
  });

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Dispatch Queue
        </h1>
        <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
          {dispatchQueue.length}
        </span>
      </div>

      <Card className="overflow-hidden">
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
          <button type="button" className={toolbarButton}>
            Sort
            <ArrowUpDown className="size-3.5" />
          </button>
          <button type="button" className={toolbarButton}>
            Filter
            <SlidersHorizontal className="size-3.5" />
          </button>
        </div>

        <div
          role="tablist"
          aria-label="Truck type"
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
          <table className="w-full min-w-[900px] text-sm">
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
              {rows.map((item) => (
                <tr
                  key={item.loadingTicketId}
                  className="border-b border-border transition-colors last:border-0 hover:bg-muted/50"
                >
                  <td className="px-5 py-3.5 font-medium text-foreground">
                    {item.loadingTicketId}
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
                    {formatLitres(item.quantityRequested)}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {item.destination}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Button
                      size="sm"
                      onClick={() =>
                        router.push(
                          `/dispatch/waybill/new?ticket=${item.loadingTicketId}`,
                        )
                      }
                    >
                      Generate Waybill
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
                    No approved tickets match your filters.
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
    </div>
  );
}
