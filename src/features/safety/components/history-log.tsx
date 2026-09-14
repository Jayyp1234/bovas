"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { Pagination, ParamTabs, PeriodFilter, SearchInput } from "@/components/ui/table-controls";
import { useToast } from "@/components/ui/toaster";
import { formatDepotTime, formatNumber } from "@/lib/format";
import { useUrlParams } from "@/lib/use-url-params";
import type { Inspection, InspectionPage } from "@/lib/api/types";

const TABS = [
  { key: "all", label: "All" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

const COLUMNS = ["Loading Ticket ID", "Inspected", "Customer", "Truck Number", "Driver", "Status"];

function SummaryCard({ label, value, tone, hint }: { label: string; value: number; tone: "neutral" | "success" | "danger"; hint: string }) {
  const toneClass = {
    neutral: "border-border bg-surface text-foreground",
    success: "border-success/20 bg-success-surface/60 text-success",
    danger: "border-danger/20 bg-danger-surface/60 text-danger",
  }[tone];

  return (
    <div className={`rounded-2xl border p-5 ${toneClass}`}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-bold">{formatNumber(value)}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

interface HistoryLogProps {
  inspections: Inspection[];
  meta: InspectionPage["meta"];
  /** Past years for the Archive menu. */
  years: number[];
}

export function HistoryLog({ inspections, meta, years }: HistoryLogProps) {
  const router = useRouter();
  const toast = useToast();
  const { query } = useUrlParams();
  const { summary } = meta;
  const lastGenerated = `Last generated ${formatDepotTime(summary.generated_at)}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <h1 className="text-xl font-bold tracking-tight text-foreground">History Log</h1>
        <div className="flex flex-wrap items-center gap-2">
          <PeriodFilter years={years} />
          <a
            href={`/download/inspection-history${query ? `?${query}` : ""}`}
            onClick={() => toast("History exported.")}
            className={buttonVariants({ size: "sm" })}
          >
            <Download className="size-4" />
            Export CSV
          </a>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryCard label="Total Trucks Inspected" value={summary.inspected} tone="neutral" hint={lastGenerated} />
        <SummaryCard label="Total Trucks Approved" value={summary.approved} tone="success" hint={lastGenerated} />
        <SummaryCard label="Total Trucks Rejected" value={summary.rejected} tone="danger" hint={lastGenerated} />
      </div>

      <Card className="overflow-hidden">
        <ParamTabs param="result" label="Result" tabs={TABS} className="border-b border-border px-5" />
        <div className="border-b border-border p-5">
          <SearchInput placeholder="Search tickets, trucks or drivers" label="Search inspections" className="sm:w-80" />
        </div>

        <div className="overflow-x-auto">
          <ResponsiveTable className="w-full min-w-[840px] text-sm">
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
              {inspections.map((record) => (
                <tr
                  key={record.ticket_no}
                  onClick={() => router.push(`/safety/history/${record.ticket_no}`)}
                  className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-muted/50"
                >
                  <td className="px-5 py-3.5 font-medium text-foreground">
                    <Link
                      href={`/safety/history/${record.ticket_no}`}
                      onClick={(event) => event.stopPropagation()}
                      className="hover:underline"
                    >
                      {record.ticket_no}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{formatDepotTime(record.inspected_at)}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{record.customer.name}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{record.truck.plate}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{record.driver?.name ?? "—"}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={record.result === "approved" ? "success" : "danger"}>
                      {record.result === "approved" ? "Approved" : "Rejected"}
                    </Badge>
                  </td>
                </tr>
              ))}
              {inspections.length === 0 && (
                <tr>
                  <td colSpan={COLUMNS.length} className="px-5 py-12 text-center text-sm text-muted-foreground">
                    No inspections match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </ResponsiveTable>
        </div>

        <Pagination page={meta.page} perPage={meta.per_page} total={meta.total} noun="inspections" />
      </Card>
    </div>
  );
}
