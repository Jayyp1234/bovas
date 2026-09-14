import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { listNotifications } from "@/lib/api/notifications";
import { requireRole } from "@/lib/auth/current-user";

export default async function DispatchLayout({ children }: { children: ReactNode }) {
  const user = await requireRole("dispatch");
  const notifications = await listNotifications();

  return (
    <DashboardShell workspace="dispatch" user={user} notifications={notifications}>
      {children}
    </DashboardShell>
  );
}
