import type { NextRequest } from "next/server";
import { AUDIT_STATUS_LABEL, TRUCK_TYPES, TRUCK_TYPE_LABEL } from "@/domain/labels";
import { listAuditEntries } from "@/lib/api/audit";
import { allPages } from "@/lib/api/pages";
import { requireRole } from "@/lib/auth/current-user";
import { csvDownload, depotIsoDate, scopeLabel, toCsv } from "@/lib/csv";
import { oneOfParam, textParam, timeParams } from "@/lib/search-params";

/** `/download/audit-log?…` — every ticket matching the Audit Log filters, as a CSV. */
export async function GET(request: NextRequest) {
  await requireRole("admin");
  const params = Object.fromEntries(request.nextUrl.searchParams);
  const time = timeParams(params);
  const filters = { ...time, truck_type: oneOfParam(params, "truck_type", TRUCK_TYPES), q: textParam(params, "q") };

  const entries = await allPages((page, perPage) => listAuditEntries({ ...filters, page, per_page: perPage }));
  const csv = toCsv([
    ["Loading Ticket ID", "Date", "Customer", "Truck Type", "Truck Number", "Product", "Requested Litres", "Destination", "Status"],
    ...entries.map((entry) => [
      entry.ticket_no,
      entry.date,
      entry.customer.name,
      TRUCK_TYPE_LABEL[entry.truck.type],
      entry.truck.plate,
      entry.product,
      entry.requested_litres,
      entry.destination_summary,
      AUDIT_STATUS_LABEL[entry.status],
    ]),
  ]);

  return csvDownload(`bovas-audit-log-${scopeLabel(time)}-${depotIsoDate()}.csv`, csv);
}
