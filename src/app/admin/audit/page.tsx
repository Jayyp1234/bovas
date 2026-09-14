import type { Metadata } from "next";
import { AuditLog } from "@/features/admin/components/audit-log";
import { TRUCK_TYPES } from "@/domain/labels";
import { listAuditEntries } from "@/lib/api/audit";
import { archiveYears, intParam, oneOfParam, textParam, timeParams, type SearchParams } from "@/lib/search-params";

export const metadata: Metadata = { title: "Audit" };

export default async function AuditPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const audit = await listAuditEntries({
    ...timeParams(params),
    truck_type: oneOfParam(params, "truck_type", TRUCK_TYPES),
    q: textParam(params, "q"),
    page: intParam(params, "page"),
    per_page: 20,
  });

  return <AuditLog entries={audit.data} meta={audit.meta} years={archiveYears()} />;
}
