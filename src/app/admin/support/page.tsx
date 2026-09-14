import type { Metadata } from "next";
import { SupportInbox } from "@/features/admin/components/support-inbox";
import { listSupportRequests } from "@/lib/api/support";
import { intParam, oneOfParam, type SearchParams } from "@/lib/search-params";

export const metadata: Metadata = { title: "Support" };

export default async function AdminSupportPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  // Open requests by default; "all" drops the filter.
  const status = oneOfParam(params, "status", ["open", "resolved", "all"] as const) ?? "open";
  const requests = await listSupportRequests({
    status: status === "all" ? undefined : status,
    page: intParam(params, "page"),
    per_page: 10,
  });

  return <SupportInbox requests={requests.data} meta={requests.meta} />;
}
