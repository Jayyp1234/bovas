import type { Metadata } from "next";
import { ReportsTable } from "@/features/dashboard/components/reports-table";

export const metadata: Metadata = { title: "Reports" };

export default function ReportsPage() {
  return <ReportsTable />;
}
