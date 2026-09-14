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
import { AUDIT_STATUS_LABEL, TRUCK_TYPE_FILTERS, TRUCK_TYPE_LABEL } from "@/domain/labels";
import { formatDepotDate, formatLitres } from "@/lib/format";
import { useUrlParams } from "@/lib/use-url-params";
import type { AuditEntry, AuditStatus, PaginationMeta } from "@/lib/api/types";

const COLUMNS = [
  "Ticket ID",
  "Date",
  "Customer",
  "Truck Type",
  "Truck Number",
  "Product",
  "Quantity",
  "Destination",
  "Status",
];

const STATUS_VARIANT: Record<AuditStatus, "success" | "warning" | "danger"> = {
  completed: "success",
  pending: "warning",
  failed: "danger",
};

interface AuditLogProps {
  entries: AuditEntry[];
  meta: PaginationMeta;
  /** Past years for the Archive menu. */
  years: number[];
}

export function AuditLog({ entries, meta, years }: AuditLogProps) {
  const router = useRouter();
  const toast = useToast();
  const { query } = useUrlParams();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Audit Log</h1>
          <p className="mt-1 text-sm text-muted-foreground">Every loading ticket and how it ended</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PeriodFilter years={years} />
          <a
            href={`/download/audit-log${query ? `?${query}` : ""}`}
            onClick={() => toast("Audit log exported.")}
            className={buttonVariants({ size: "sm" })}
          >
            <Download className="size-4" />
            Export CSV
          </a>
        </div>
      </div>

      <Card className="overflow-hidden">
        <ParamTabs param="truck_type" label="Truck type" tabs={TRUCK_TYPE_FILTERS} className="border-b border-border px-5" />
        <div className="border-b border-border p-5">
          <SearchInput placeholder="Search tickets" label="Search the audit log" className="sm:w-80" />
        </div>

        <div className="overflow-x-auto">
          <ResponsiveTable className="w-full min-w-[1040px] text-sm">
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
              {entries.map((entry) => (
                <tr
                  key={entry.ticket_no}
                  onClick={() => router.push(`/admin/audit/${entry.ticket_no}`)}
                  className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-muted/50"
                >
                  <td className="px-5 py-3.5 font-medium text-foreground">
                    <Link
                      href={`/admin/audit/${entry.ticket_no}`}
                      onClick={(event) => event.stopPropagation()}
                      className="hover:underline"
                    >
                      {entry.ticket_no}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{formatDepotDate(entry.date)}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{entry.customer.name}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{TRUCK_TYPE_LABEL[entry.truck.type]}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{entry.truck.plate}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{entry.product}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{formatLitres(entry.requested_litres)}</td>
                  <td className="max-w-[240px] truncate px-5 py-3.5 text-muted-foreground">{entry.destination_summary}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={STATUS_VARIANT[entry.status]} withDot>
                      {AUDIT_STATUS_LABEL[entry.status]}
                    </Badge>
                  </td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={COLUMNS.length} className="px-5 py-12 text-center text-sm text-muted-foreground">
                    No tickets match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </ResponsiveTable>
        </div>

        <Pagination page={meta.page} perPage={meta.per_page} total={meta.total} noun="tickets" />
      </Card>
    </div>
  );
}
