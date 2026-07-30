import type { Metadata } from "next";
import { DispatchDashboard } from "@/features/dispatch/components/dispatch-dashboard";

export const metadata: Metadata = { title: "Dispatch Dashboard" };

export default function DispatchDashboardPage() {
  return <DispatchDashboard />;
}
