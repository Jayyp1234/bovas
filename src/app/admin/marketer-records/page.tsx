import type { Metadata } from "next";
import { MarketerRecords } from "@/features/admin/components/marketer-records";
import { TRUCK_TYPES } from "@/domain/labels";
import { listCustomers } from "@/lib/api/customers";
import { intParam, oneOfParam, textParam, type SearchParams } from "@/lib/search-params";

export const metadata: Metadata = { title: "Marketer's Records" };

export default async function MarketerRecordsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const customers = await listCustomers({
    q: textParam(params, "q"),
    kind: oneOfParam(params, "kind", TRUCK_TYPES),
    page: intParam(params, "page"),
    per_page: 20,
  });

  return <MarketerRecords customers={customers.data} meta={customers.meta} />;
}
