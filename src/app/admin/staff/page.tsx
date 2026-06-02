import type { Metadata } from "next";
import { StaffManagement } from "@/features/admin/components/staff-management";

export const metadata: Metadata = { title: "Staff Management" };

export default function StaffPage() {
  return <StaffManagement />;
}
