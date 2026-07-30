"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
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
import { formatLitres } from "@/lib/format";
import { waybills } from "../data/waybills";
import type { TruckType, Waybill } from "../data/waybills";

const TABS = ["All", "Internal", "Marketer", "Industrial"] as const;
type TabKey = (typeof TABS)[number];

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
  "Waybill ID",
  "Customer",
  "Truck Type",
  "Truck Number",
  "Product",
  "Requested Quantity",
];

const controlSelect =
  "h-9 rounded-lg border border-border bg-surface px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";
const menuItem =
  "flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted";

function matchesTab(item: Waybill, tab: TabKey) {
  if (tab === "All") return true;
  return item.truckType === (tab as TruckType);
}

export function WaybillHistoryTable() {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("All");
  const [query, setQuery] = useState("");
  const [exportOpen, setExportOpen] = useState(false);
  const [openRow, setOpenRow] = useState<string | null>(null);

  const rows = waybills.filter((item) => {
    if (!matchesTab(item, tab)) return false;
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
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-base font-semibold text-foreground">
              Waybill History
            </h1>
            <p className="text-sm text-muted-foreground">
              Overview of today&apos;s loading activities
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="sm">
              This Week
            </Button>
            <select className={controlSelect} defaultValue="2026" aria-label="Year">
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
              placeholder="Search Tickets"
              aria-label="Search waybills"
              className="h-9 w-44 pl-9 text-xs"
            />
          </div>
          {TABS.map((item) => {
            const active = tab === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
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
          <table className="w-full min-w-[960px] text-sm">
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
              {rows.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-border transition-colors last:border-0 hover:bg-muted/50"
                >
                  <td className="px-5 py-3.5">
                    <Checkbox id={`waybill-${item.id}`} />
                  </td>
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
                  <td className="px-5 py-3.5 text-right">
                    <div className="relative inline-block">
                      <button
                        type="button"
                        aria-label={`Actions for waybill ${item.id}`}
                        onClick={() =>
                          setOpenRow(openRow === item.id ? null : item.id)
                        }
                        className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
                      >
                        <MoreHorizontal className="size-4" />
                      </button>
                      {openRow === item.id && (
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
                                router.push(
                                  `/dispatch/waybill-history/${item.id}`,
                                );
                              }}
                              className={menuItem}
                            >
                              <Eye className="size-4 text-muted-foreground" />
                              View Waybill
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
                              Print Waybill
                            </button>
                            <button
                              type="button"
                              onClick={() => setOpenRow(null)}
                              className={menuItem}
                            >
                              <Download className="size-4 text-muted-foreground" />
                              Download Waybill
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
