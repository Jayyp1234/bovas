"use client";

import { Download } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { Pagination, ParamTabs, PeriodFilter, SearchInput } from "@/components/ui/table-controls";
import { useToast } from "@/components/ui/toaster";
import { TRUCK_TYPE_FILTERS, TRUCK_TYPE_LABEL } from "@/domain/labels";
import { formatDepotTime, formatLitres, formatNumber, formatVariance } from "@/lib/format";
import { useUrlParams } from "@/lib/use-url-params";
import type { ActivityReportPage } from "@/lib/api/types";

const COLUMNS = [
  "Loading Ticket ID",
  "Waybill ID",
  "Customer",
  "Truck Type",
  "Truck Number",
  "Product",
  "Requested",
  "Loaded",
  "Variance",
];

const PERIOD_TEXT: Record<string, string> = {
  today: "today",
  week: "this week",
  month: "this month",
  year: "this year",
};

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

interface ActivityReportProps {
  report: ActivityReportPage;
  /** Past years for the Archive menu. */
  years: number[];
}

/**
 * Loaded trucks with litres requested and loaded, for Admin and Logistics. Filters live in the
 * URL, and Export downloads the same view as a CSV.
 */
export function ActivityReport({ report, years }: ActivityReportProps) {
  const toast = useToast();
  const { get, query } = useUrlParams();
  const { totals, generated_at: generatedAt, page, per_page: perPage, total } = report.meta;

  const year = get("year");
  const scope = year ? `in ${year}` : (PERIOD_TEXT[get("period") ?? "today"] ?? "today");
  const lastGenerated = `Last generated ${formatDepotTime(generatedAt)}`;
  const exportHref = `/download/activity-report${query ? `?${query}` : ""}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Activity Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">Trucks loaded {scope}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PeriodFilter years={years} />
          <a href={exportHref} onClick={() => toast("Report exported.")} className={buttonVariants({ size: "sm" })}>
            <Download className="size-4" />
            Export CSV
          </a>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Trucks Loaded" value={formatNumber(total)} hint={lastGenerated} />
        <Stat label="Total Amount Requested" value={formatLitres(totals.requested_litres)} hint={lastGenerated} />
        <Stat label="Total Amount Loaded" value={formatLitres(totals.loaded_litres)} hint={lastGenerated} />
        <Stat label="Variance" value={formatVariance(totals.variance_litres)} hint="Loaded minus requested" />
      </div>

      <Card className="overflow-hidden">
        <ParamTabs param="truck_type" label="Truck type" tabs={TRUCK_TYPE_FILTERS} className="border-b border-border px-5" />
        <div className="border-b border-border p-5">
          <SearchInput placeholder="Search tickets, waybills or trucks" label="Search the report" className="sm:w-80" />
        </div>

        <div className="overflow-x-auto">
          <ResponsiveTable className="w-full min-w-[1080px] text-sm">
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
              {report.data.map((row) => {
                const variance = (row.loaded_litres ?? 0) - row.requested_litres;
                return (
                  <tr key={row.ticket_no} className="border-b border-border transition-colors last:border-0 hover:bg-muted/50">
                    <td className="px-5 py-3.5 font-medium text-foreground">{row.ticket_no}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{row.waybill_no ?? "Not issued"}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{row.customer.name}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{TRUCK_TYPE_LABEL[row.truck.type]}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{row.truck.plate}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{row.product}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{formatLitres(row.requested_litres)}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {row.loaded_litres === null ? "—" : formatLitres(row.loaded_litres)}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{formatVariance(variance)}</td>
                  </tr>
                );
              })}
              {report.data.length === 0 && (
                <tr>
                  <td colSpan={COLUMNS.length} className="px-5 py-12 text-center text-sm text-muted-foreground">
                    No trucks match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </ResponsiveTable>
        </div>

        <Pagination page={page} perPage={perPage} total={total} noun="loaded trucks" />
      </Card>
    </div>
  );
}
