import type { Metadata } from "next";
import { StaffDetail } from "@/features/admin/components/staff-detail";

export const metadata: Metadata = { title: "Staff Detail" };

interface StaffDetailPageProps {
  params: Promise<{ staffId: string }>;
}

export default async function StaffDetailPage({ params }: StaffDetailPageProps) {
  const { staffId } = await params;
  return <StaffDetail staffId={staffId} />;
}
