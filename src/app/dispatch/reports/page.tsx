import type { Metadata } from "next";
import { DispatchReports } from "@/features/dispatch/components/dispatch-reports";

export const metadata: Metadata = { title: "Reports" };

export default function DispatchReportsPage() {
  return <DispatchReports />;
}
