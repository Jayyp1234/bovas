import type { Metadata } from "next";
import { ActivityReport } from "@/features/reports/components/activity-report";
import { TRUCK_TYPES } from "@/domain/labels";
import { getActivityReport } from "@/lib/api/reports";
import { archiveYears, intParam, oneOfParam, textParam, timeParams, type SearchParams } from "@/lib/search-params";

export const metadata: Metadata = { title: "Reports" };

/** Logistics sees the same Activity Report as Admin. */
export default async function ReportsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const report = await getActivityReport({
    ...timeParams(params),
    truck_type: oneOfParam(params, "truck_type", TRUCK_TYPES),
    q: textParam(params, "q"),
    page: intParam(params, "page"),
    per_page: 20,
  });

  return <ActivityReport report={report} years={archiveYears()} />;
}
