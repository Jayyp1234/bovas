import type { ReactNode } from "react";
import { SafetyShell } from "@/features/safety/components/safety-shell";
import { listNotifications } from "@/lib/api/notifications";
import { getSafetyQueue } from "@/lib/api/safety";
import { requireRole } from "@/lib/auth/current-user";

export default async function SafetyLayout({ children }: { children: ReactNode }) {
  const user = await requireRole("safety");
  const [queue, notifications] = await Promise.all([getSafetyQueue(), listNotifications()]);

  return (
    <SafetyShell user={user} notifications={notifications} badges={{ "/safety/tickets": queue.meta.total }}>
      {children}
    </SafetyShell>
  );
}
