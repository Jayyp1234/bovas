import "server-only";
import { csvDownload } from "@/lib/csv";
import { apiDownload, apiRequest, fromApi, isLive } from "./client";
import * as mock from "./mock/reports";
import type { ActivityReportCsvQuery, ActivityReportPage, ActivityReportQuery } from "./types";

/** The build phase that implements reports (x-phase in openapi.yaml). */
const PHASE = 5;

/** Loaded trucks with totals for the whole period. `GET /api/reports/activity` */
export function getActivityReport(query: ActivityReportQuery = {}): Promise<ActivityReportPage> {
  return fromApi<ActivityReportPage>(
    PHASE,
    () => apiRequest("/api/reports/activity", { query }),
    () => mock.getActivityReport(query),
  );
}

/**
 * The same report as a CSV download, ready to return from a route handler. The API's response
 * is streamed straight through, so large reports never sit in memory.
 * `GET /api/reports/activity.csv`
 */
export async function downloadActivityReport(query: ActivityReportCsvQuery): Promise<Response> {
  if (!isLive(PHASE)) {
    const { filename, csv } = await mock.exportActivityReport(query);
    return csvDownload(filename, csv);
  }

  const upstream = await apiDownload("/api/reports/activity.csv", { query });
  return new Response(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "text/csv; charset=utf-8",
      "Content-Disposition":
        upstream.headers.get("Content-Disposition") ?? 'attachment; filename="bovas-activity-report.csv"',
      "Cache-Control": "no-store",
    },
  });
}
