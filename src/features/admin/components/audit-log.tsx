"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowUpDown,
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { auditRecords } from "../data/audit";

const TABS = [
  { id: "all", label: "All" },
  { id: "internal", label: "Internal" },
  { id: "marketer", label: "Marketer" },
  { id: "industrial", label: "Industrial" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const COLUMNS = [
  "Customer",
  "Truck Type",
  "Truck Number",
  "Product",
  "Quantity",
  "Destination",
];

const toolbarButton =
  "inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted";

const filterPill =
  "inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted";

export function AuditLog() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<TabId>("all");
  const [period, setPeriod] = useState<"today" | "week">("today");

  const rows = auditRecords.filter((entry) => {
    if (tab !== "all" && entry.truckType.toLowerCase() !== tab) return false;
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return (
      entry.customer.toLowerCase().includes(q) ||
      entry.truckNumber.toLowerCase().includes(q) ||
      entry.destination.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Audit Log
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Overview of loading activities
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-border bg-surface p-0.5">
            <button
              type="button"
              onClick={() => setPeriod("today")}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                period === "today"
                  ? "bg-foreground text-surface"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setPeriod("week")}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                period === "week"
                  ? "bg-foreground text-surface"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              This Week
            </button>
          </div>
          <button type="button" className={filterPill}>
            2026
            <ChevronDown className="size-3.5" />
          </button>
          <button type="button" className={filterPill}>
            Archive
            <ChevronDown className="size-3.5" />
          </button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div
          role="tablist"
          aria-label="Truck type"
          className="flex gap-6 border-b border-border px-5"
        >
          {TABS.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(item.id)}
                className={cn(
                  "-mb-px border-b-2 py-3 text-sm font-medium transition-colors",
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

        <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Tickets"
              aria-label="Search tickets"
              className="h-9 pl-9 text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className={toolbarButton}>
              Sort
              <ArrowUpDown className="size-3.5" />
            </button>
            <button type="button" className={toolbarButton}>
              Filter
              <SlidersHorizontal className="size-3.5" />
            </button>
            <Button size="sm">Export</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                <th className="w-10 px-5 py-3">
                  <input
                    type="checkbox"
                    aria-label="Select all"
                    className="size-4 rounded border-input accent-primary"
                  />
                </th>
                {COLUMNS.map((column) => (
                  <th key={column} className="px-5 py-3 font-medium">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((entry) => (
                <tr
                  key={entry.id}
                  onClick={() => router.push(`/admin/audit/${entry.id}`)}
                  className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-muted/50"
                >
                  <td
                    className="px-5 py-3.5"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      aria-label={`Select ${entry.customer}`}
                      className="size-4 rounded border-input accent-primary"
                    />
                  </td>
                  <td className="px-5 py-3.5 font-medium text-foreground">
                    {entry.customer}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {entry.truckType}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {entry.truckNumber}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {entry.product}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {entry.quantity}
                  </td>
                  <td className="max-w-[260px] truncate px-5 py-3.5 text-muted-foreground">
                    {entry.destination}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={COLUMNS.length + 1}
                    className="px-5 py-12 text-center text-sm text-muted-foreground"
                  >
                    No audit entries match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-4 text-xs text-muted-foreground">
          <button
            type="button"
            className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            Previous
          </button>
          <span>Showing 41-50 of 100 Loaded trucks</span>
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
