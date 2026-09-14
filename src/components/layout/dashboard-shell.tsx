"use client";

import { useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { Sidebar, SidebarContent, type Workspace } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import type { NotificationList, User } from "@/lib/api/types";

interface DashboardShellProps {
  children: ReactNode;
  workspace: Workspace;
  /** The signed-in staff member, from the workspace layout. */
  user: User;
  /** Their notifications as of this render; the bell keeps them fresh. */
  notifications: NotificationList;
}

export function DashboardShell({ children, workspace, user, notifications }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar workspace={workspace} />

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
            <SidebarContent workspace={workspace} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={user} notifications={notifications} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 print:p-0">{children}</main>
      </div>
    </div>
  );
}
