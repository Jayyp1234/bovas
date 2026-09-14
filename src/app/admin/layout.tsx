import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { listNotifications } from "@/lib/api/notifications";
import { requireRole } from "@/lib/auth/current-user";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireRole("admin");
  const notifications = await listNotifications();

  return (
    <DashboardShell workspace="admin" user={user} notifications={notifications}>
      {children}
    </DashboardShell>
  );
}
