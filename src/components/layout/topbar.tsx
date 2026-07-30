"use client";

import { useState } from "react";
import { Bell, Menu, CheckCircle2, ClipboardList, TriangleAlert, FileText } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

export interface TopbarUser {
  name: string;
  role: string;
  avatarUrl?: string;
}

interface TopbarProps {
  user: TopbarUser;
  onMenuClick: () => void;
}

interface Notification {
  icon: LucideIcon;
  title: string;
  time: string;
}

/** Role-specific notifications. */
const NOTIFICATIONS: Record<string, Notification[]> = {
  Logistics: [
    {
      icon: CheckCircle2,
      title: "Loading ticket #24989001 was approved by Safety.",
      time: "5m ago",
    },
    {
      icon: ClipboardList,
      title: "A new loading program was uploaded.",
      time: "1h ago",
    },
  ],
  Admin: [
    {
      icon: TriangleAlert,
      title: "Dispatch requested approval for overloading on truck BDJ580XB.",
      time: "12m ago",
    },
  ],
  Dispatch: [
    {
      icon: TriangleAlert,
      title: "Truck BDJ580XB is overloaded by +500 Litres. Admin approval required.",
      time: "8m ago",
    },
    {
      icon: FileText,
      title: "Loading ticket #21040705 is approved and ready for a waybill.",
      time: "40m ago",
    },
  ],
};

export function Topbar({ user, onMenuClick }: TopbarProps) {
  const [open, setOpen] = useState(false);
  const notifications = NOTIFICATIONS[user.role] ?? [];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-surface/80 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
        className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
        <div className="relative">
          <button
            type="button"
            aria-label="Notifications"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="relative inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
          >
            <Bell className="size-5" />
            {notifications.length > 0 && (
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary" />
            )}
          </button>

          {open && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setOpen(false)}
                aria-hidden
              />
              <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
                <div className="border-b border-border px-4 py-3">
                  <p className="text-sm font-semibold text-foreground">
                    Notifications
                  </p>
                </div>
                {notifications.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                    You&apos;re all caught up.
                  </p>
                ) : (
                  <ul className="max-h-80 overflow-y-auto">
                    {notifications.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <li
                          key={index}
                          className="flex gap-3 border-b border-border px-4 py-3 last:border-0 hover:bg-muted/50"
                        >
                          <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                            <Icon className="size-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm text-foreground">
                              {item.title}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {item.time}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <Avatar name={user.name} src={user.avatarUrl} />
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-semibold text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
