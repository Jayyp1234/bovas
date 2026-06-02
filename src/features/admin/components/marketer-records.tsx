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
import { cn } from "@/lib/utils";

interface MarketerRecord {
  marketer: string;
  representative: string;
  phone: string;
  email: string;
}

const records: MarketerRecord[] = Array.from({ length: 13 }, () => ({
  marketer: "Feasible Path",
  representative: "Elizabeth Fadenipo",
  phone: "08104205202",
  email: "elizabethfadenipo@gmail.com",
}));

const COLUMNS = ["Marketer", "Representative", "Phone Number", "Email Address"];

const toolbarButton =
  "inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted";

export function MarketerRecords() {
  const [query, setQuery] = useState("");

  const rows = records.filter((record) => {
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return (
      record.marketer.toLowerCase().includes(q) ||
      record.representative.toLowerCase().includes(q) ||
      record.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold tracking-tight text-foreground">
        Marketers&apos; Records
      </h1>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Tickets"
              aria-label="Search records"
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
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-y border-border bg-muted/40 text-left text-xs font-medium text-muted-foreground">
                {COLUMNS.map((column) => (
                  <th key={column} className="px-5 py-3 font-medium">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((record, index) => (
                <tr
                  key={index}
                  className="border-b border-border transition-colors last:border-0 hover:bg-muted/50"
                >
                  <td className="px-5 py-3.5 font-medium text-foreground">
                    {record.marketer}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {record.representative}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {record.phone}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {record.email}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-4 text-xs text-muted-foreground">
          <button
            type="button"
            className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            Previous
          </button>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((page) => (
              <button
                key={page}
                type="button"
                aria-current={page === 3 ? "page" : undefined}
                className={cn(
                  "size-7 rounded-md transition-colors",
                  page === 3
                    ? "bg-primary font-semibold text-primary-foreground"
                    : "hover:bg-muted",
                )}
              >
                {page}
              </button>
            ))}
          </div>
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
