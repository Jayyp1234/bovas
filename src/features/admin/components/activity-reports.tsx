"use client";

import { useState } from "react";
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

interface ActivityRecord {
  loadingTicketId: string;
  waybillId: string;
  customer: string;
  truckType: "Internal" | "Marketer" | "Industrial";
  truckNumber: string;
  product: string;
  requestedQuantity: string;
}

const activityRecords: ActivityRecord[] = [
  { loadingTicketId: "210407001", waybillId: "A1234567", customer: "BOVAS", truckType: "Internal", truckNumber: "BDJ590XA", product: "PMS", requestedQuantity: "45,000 Litres" },
  { loadingTicketId: "210407002", waybillId: "A1234568", customer: "Fatgbems", truckType: "Industrial", truckNumber: "BDJ590XA", product: "PMS", requestedQuantity: "33,000 Litres" },
  { loadingTicketId: "210407003", waybillId: "A1234569", customer: "Connoil", truckType: "Industrial", truckNumber: "BDJ590XA", product: "PMS", requestedQuantity: "60,000 Litres" },
  { loadingTicketId: "210407004", waybillId: "A1234570", customer: "BOVAS", truckType: "Internal", truckNumber: "BDJ590XA", product: "PMS", requestedQuantity: "45,000 Litres" },
  { loadingTicketId: "210407005", waybillId: "A1234571", customer: "MRS", truckType: "Industrial", truckNumber: "T12345-LA", product: "PMS", requestedQuantity: "60,000 Litres" },
  { loadingTicketId: "210407006", waybillId: "A1234572", customer: "Babatunde", truckType: "Marketer", truckNumber: "BDJ590XA", product: "PMS", requestedQuantity: "33,000 Litres" },
  { loadingTicketId: "210407007", waybillId: "A1234573", customer: "Hill Crest", truckType: "Marketer", truckNumber: "BDJ590XA", product: "PMS", requestedQuantity: "45,000 Litres" },
  { loadingTicketId: "210407008", waybillId: "A1234574", customer: "Feasible Path", truckType: "Marketer", truckNumber: "BDJ590XA", product: "PMS", requestedQuantity: "50,000 Litres" },
  { loadingTicketId: "210407009", waybillId: "A1234575", customer: "Jots M", truckType: "Marketer", truckNumber: "BDJ590XA", product: "PMS", requestedQuantity: "45,000 Litres" },
  { loadingTicketId: "210407010", waybillId: "A1234576", customer: "Fatgbems", truckType: "Industrial", truckNumber: "BDJ590XA", product: "PMS", requestedQuantity: "45,000 Litres" },
];

const TABS = [
  { id: "all", label: "All" },
  { id: "internal", label: "Internal" },
  { id: "marketer", label: "Marketer" },
  { id: "industrial", label: "Industrial" },
] as const;

type TabId = (typeof TABS)[number]["id"];

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

export function ActivityReports() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<TabId>("all");

  const rows = activityRecords.filter((record) => {
    if (tab !== "all" && record.truckType.toLowerCase() !== tab) return false;
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return (
      record.loadingTicketId.includes(q) ||
      record.waybillId.toLowerCase().includes(q) ||
      record.customer.toLowerCase().includes(q) ||
      record.truckNumber.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Activity Reports
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of today&apos;s loading activities
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-warning/20 bg-warning-surface/60 p-5">
          <p className="text-sm text-muted-foreground">Total Amount Requested</p>
          <p className="mt-3 text-2xl font-bold text-foreground">1,500,340 Litres</p>
          <p className="mt-1 text-xs text-muted-foreground">Last generated 14:06</p>
        </div>
        <div className="rounded-2xl border border-success/20 bg-success-surface/60 p-5">
          <p className="text-sm text-muted-foreground">Total Amount Loaded</p>
          <p className="mt-3 text-2xl font-bold text-success">1,500,840 Litres</p>
          <p className="mt-1 text-xs text-muted-foreground">Last generated 14:06</p>
        </div>
        <div className="rounded-2xl border border-danger/20 bg-danger-surface/60 p-5">
          <p className="text-sm text-muted-foreground">Variance</p>
          <p className="mt-3 text-2xl font-bold text-danger">+500 Litres</p>
        </div>
      </div>

      <div>
        <div
          role="tablist"
          aria-label="Truck type"
          className="flex gap-6 border-b border-border"
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

        <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative sm:w-80">
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

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-sm">
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
                {rows.map((record) => (
                  <tr
                    key={record.loadingTicketId}
                    className="border-b border-border transition-colors last:border-0 hover:bg-muted/50"
                  >
                    <td className="px-5 py-3.5 font-medium text-foreground">
                      {record.loadingTicketId}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{record.waybillId}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{record.customer}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{record.truckType}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{record.truckNumber}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{record.product}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{record.requestedQuantity}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={COLUMNS.length}
                      className="px-5 py-12 text-center text-sm text-muted-foreground"
                    >
                      No records match your filters.
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
    </div>
  );
}
