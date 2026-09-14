import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StaffDetail } from "@/features/admin/components/staff-detail";
import { getNextStaffNo, getStaff } from "@/lib/api/staff";
import { listTerminals } from "@/lib/api/terminals";
import { requireRole } from "@/lib/auth/current-user";

export const metadata: Metadata = { title: "Staff Detail" };

interface StaffDetailPageProps {
  /** A staff number, or "new" to add a staff member. */
  params: Promise<{ staffId: string }>;
}

export default async function StaffDetailPage({ params }: StaffDetailPageProps) {
  const { staffId } = await params;
  const [viewer, terminals] = await Promise.all([requireRole("admin"), listTerminals()]);

  if (staffId === "new") {
    const { staff_no } = await getNextStaffNo();
    return <StaffDetail staff={null} staffNo={staff_no} terminals={terminals.data} viewerStaffNo={viewer.staff_no} />;
  }

  const staff = await getStaff(staffId);
  if (!staff) {
    notFound();
  }

  return (
    <StaffDetail staff={staff} staffNo={staff.staff_no} terminals={terminals.data} viewerStaffNo={viewer.staff_no} />
  );
}
