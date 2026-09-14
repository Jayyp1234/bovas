import type { NextRequest } from "next/server";
import { REJECTION_REASON_LABEL } from "@/domain/labels";
import { allPages } from "@/lib/api/pages";
import { listInspections } from "@/lib/api/safety";
import { requireRole } from "@/lib/auth/current-user";
import { csvDownload, depotIsoDate, scopeLabel, toCsv } from "@/lib/csv";
import { formatDepotTime } from "@/lib/format";
import { oneOfParam, textParam, timeParams } from "@/lib/search-params";

/** `/download/inspection-history?…` — every inspection matching the History Log filters, as a CSV. */
export async function GET(request: NextRequest) {
  await requireRole("safety");
  const params = Object.fromEntries(request.nextUrl.searchParams);
  const time = timeParams(params);
  const filters = {
    ...time,
    result: oneOfParam(params, "result", ["approved", "rejected"] as const),
    q: textParam(params, "q"),
  };

  const inspections = await allPages((page, perPage) => listInspections({ ...filters, page, per_page: perPage }));
  const csv = toCsv([
    ["Loading Ticket ID", "Date", "Time", "Customer", "Truck Number", "Driver", "Result", "Reason", "Notes", "Inspector"],
    ...inspections.map((inspection) => [
      inspection.ticket_no,
      depotIsoDate(inspection.inspected_at),
      formatDepotTime(inspection.inspected_at),
      inspection.customer.name,
      inspection.truck.plate,
      inspection.driver?.name,
      inspection.result === "approved" ? "Approved" : "Rejected",
      inspection.reason_code ? REJECTION_REASON_LABEL[inspection.reason_code] : "",
      inspection.notes,
      inspection.inspector.name,
    ]),
  ]);

  return csvDownload(`bovas-inspection-history-${scopeLabel(time)}-${depotIsoDate()}.csv`, csv);
}
