"use client";

import { useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { Sidebar, SidebarContent, type DashboardRole } from "@/components/layout/sidebar";
import { Topbar, type TopbarUser } from "@/components/layout/topbar";

/**
 * Placeholder signed-in users per role. Replaced when a real profile is passed in.
 */
const USER_BY_ROLE: Record<DashboardRole, TopbarUser> = {
  admin: { name: "Olayinka Fagboore", role: "Admin" },
  logistics: { name: "Olateju Oyetoke", role: "Logistics" },
  dispatch: { name: "Chidinma Eboh", role: "Dispatch" },
};

export function DashboardShell({
  children,
  role = "logistics",
  user,
}: {
  children: ReactNode;
  role?: DashboardRole;
  user?: TopbarUser | null;
}) {
  const currentUser = user ?? USER_BY_ROLE[role];
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role={role} />

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 w-72 bg-surface shadow-xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
              className="absolute right-3 top-4 inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
            >
              <X className="size-5" />
            </button>
            <SidebarContent role={role} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={currentUser} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
