"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { Pagination, ParamTabs, SearchInput } from "@/components/ui/table-controls";
import { TRUCK_TYPE_FILTERS, TRUCK_TYPE_LABEL } from "@/domain/labels";
import { formatLitres } from "@/lib/format";
import type { PaginationMeta, ProgramItem } from "@/lib/api/types";

const COLUMNS = ["Customer", "Truck Type", "Truck Number", "Product", "Quantity Requested", "Destination"];

interface LoadingProgramTableProps {
  items: ProgramItem[];
  meta: PaginationMeta;
}

export function LoadingProgramTable({ items, meta }: LoadingProgramTableProps) {
  return (
    <Card className="overflow-hidden">
      <div className="p-5">
        <h3 className="text-base font-semibold text-foreground">Loading Program</h3>
        <p className="text-sm text-muted-foreground">Start a ticket for each truck on today&apos;s program.</p>
      </div>

      <div className="flex flex-col gap-3 border-b border-border px-5 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput placeholder="Search trucks…" label="Search the loading program" className="w-56 pt-3 sm:py-3" />
        <ParamTabs param="truck_type" label="Truck type" tabs={TRUCK_TYPE_FILTERS} />
      </div>

      <div className="overflow-x-auto">
        <ResponsiveTable className="w-full min-w-[820px] text-sm">
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
            {items.map((item) => (
              <tr key={item.id} className="border-b border-border transition-colors last:border-0 hover:bg-muted/50">
                <td className="px-5 py-3.5 font-medium text-foreground">{item.customer.name}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{TRUCK_TYPE_LABEL[item.truck.type]}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{item.truck.plate}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{item.product}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{formatLitres(item.quantity_litres)}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{item.destination}</td>
                <td className="px-5 py-3.5 text-right">
                  {item.ticket_no ? (
                    <Link href={`/ticket-history/${item.ticket_no}`} className={buttonVariants({ variant: "secondary", size: "sm" })}>
                      Ticket {item.ticket_no}
                    </Link>
                  ) : (
                    <Link href={`/generate-ticket?item=${item.id}`} className={buttonVariants({ size: "sm" })}>
                      Start Ticket
                    </Link>
                  )}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length + 1} className="px-5 py-12 text-center text-sm text-muted-foreground">
                  No trucks match. If nothing shows without filters, today&apos;s program hasn&apos;t been uploaded yet.
                </td>
              </tr>
            )}
          </tbody>
        </ResponsiveTable>
      </div>

      <Pagination page={meta.page} perPage={meta.per_page} total={meta.total} noun="trucks" />
    </Card>
  );
}
