import type { Metadata } from "next";
import { ActivityReports } from "@/features/admin/components/activity-reports";

export const metadata: Metadata = { title: "Activity Reports" };

export default function ActivityReportsPage() {
  return <ActivityReports />;
}
