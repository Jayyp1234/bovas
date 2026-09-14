import type { Metadata } from "next";
import { LoadingProgramTable } from "@/features/dashboard/components/loading-program-table";
import { TRUCK_TYPES } from "@/domain/labels";
import { listProgramItems } from "@/lib/api/programs";
import { intParam, oneOfParam, textParam, type SearchParams } from "@/lib/search-params";

export const metadata: Metadata = { title: "Loading Program" };

export default async function LoadingProgramPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const program = await listProgramItems({
    truck_type: oneOfParam(params, "truck_type", TRUCK_TYPES),
    q: textParam(params, "q"),
    page: intParam(params, "page"),
    per_page: 20,
  });

  return <LoadingProgramTable items={program.data} meta={program.meta} />;
}
