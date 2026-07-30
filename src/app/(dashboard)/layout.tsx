import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getCurrentProfile } from "@/lib/auth/profile";
import { displayLabelForRole } from "@/lib/auth/roles";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await getCurrentProfile();
  const user = profile
    ? {
        name: profile.full_name,
        role: displayLabelForRole(profile.role),
      }
    : null;

  return (
    <DashboardShell role="logistics" user={user}>
      {children}
    </DashboardShell>
  );
}
