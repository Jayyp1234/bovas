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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { safetyRecords } from "../data/safety";

const TABS = [
  { id: "all", label: "All" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const COLUMNS = ["Loading Ticket ID", "Customer", "Truck Number", "Driver", "Status"];

const toolbarButton =
  "inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted";
const filterPill = toolbarButton;

export function HistoryLog() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<TabId>("all");
  const [period, setPeriod] = useState<"today" | "week">("today");

  const rows = safetyRecords.filter((record) => {
    if (tab !== "all" && record.status !== tab) return false;
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return (
      record.id.includes(q) ||
      record.customer.toLowerCase().includes(q) ||
      record.truckNumber.toLowerCase().includes(q) ||
      record.driver.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          History Log
        </h1>
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-sm text-muted-foreground">Total Trucks Inspected</p>
          <p className="mt-3 text-3xl font-bold text-foreground">400</p>
          <p className="mt-1 text-xs text-muted-foreground">Last generated 14:06</p>
        </div>
        <div className="rounded-2xl border border-success/20 bg-success-surface/60 p-5">
          <p className="text-sm text-muted-foreground">Total Trucks Approved</p>
          <p className="mt-3 text-3xl font-bold text-success">350</p>
          <p className="mt-1 text-xs text-muted-foreground">Last generated 14:06</p>
        </div>
        <div className="rounded-2xl border border-danger/20 bg-danger-surface/60 p-5">
          <p className="text-sm text-muted-foreground">Total Trucks Rejected</p>
          <p className="mt-3 text-3xl font-bold text-danger">50</p>
          <p className="mt-1 text-xs text-muted-foreground">Last generated 14:06</p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div
          role="tablist"
          aria-label="Status"
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
          <table className="w-full min-w-[760px] text-sm">
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
              {rows.map((record) => (
                <tr
                  key={record.id}
                  onClick={() => router.push(`/safety/history/${record.id}`)}
                  className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-muted/50"
                >
                  <td className="px-5 py-3.5 font-medium text-foreground">
                    {record.id}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {record.customer}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {record.truckNumber}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {record.driver}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge
                      variant={record.status === "approved" ? "success" : "danger"}
                    >
                      {record.status === "approved" ? "Approved" : "Rejected"}
                    </Badge>
                  </td>
                </tr>
              ))}
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
