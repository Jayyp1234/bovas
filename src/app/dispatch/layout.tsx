import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function DispatchLayout({ children }: { children: ReactNode }) {
  return <DashboardShell role="dispatch">{children}</DashboardShell>;
}
