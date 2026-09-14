import type { Metadata } from "next";
import { StaffManagement } from "@/features/admin/components/staff-management";
import { listStaff } from "@/lib/api/staff";
import { intParam, oneOfParam, textParam, type SearchParams } from "@/lib/search-params";

export const metadata: Metadata = { title: "Staff Management" };

export default async function StaffPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const status = oneOfParam(params, "status", ["active", "inactive"] as const);

  const staff = await listStaff({
    q: textParam(params, "q"),
    department: textParam(params, "department"),
    active: status === undefined ? undefined : status === "active",
    page: intParam(params, "page"),
    per_page: 20,
  });

  return <StaffManagement staff={staff.data} meta={staff.meta} />;
}
