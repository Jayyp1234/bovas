import type { Metadata } from "next";
import { HistoryLog } from "@/features/safety/components/history-log";
import { listInspections } from "@/lib/api/safety";
import { archiveYears, intParam, oneOfParam, textParam, timeParams, type SearchParams } from "@/lib/search-params";

export const metadata: Metadata = { title: "History Log" };

export default async function HistoryPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const inspections = await listInspections({
    ...timeParams(params),
    result: oneOfParam(params, "result", ["approved", "rejected"] as const),
    q: textParam(params, "q"),
    page: intParam(params, "page"),
    per_page: 20,
  });

  return <HistoryLog inspections={inspections.data} meta={inspections.meta} years={archiveYears()} />;
}
