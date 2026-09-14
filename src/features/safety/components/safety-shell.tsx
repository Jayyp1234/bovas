"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { safetyNav } from "@/config/nav";
import { ROLE_LABEL } from "@/domain/roles";
import { Logo } from "@/components/brand/logo";
import { Avatar } from "@/components/ui/avatar";
import { NotificationBell } from "@/components/layout/notification-bell";
import { signOut } from "@/features/auth/actions";
import type { NotificationList, User } from "@/lib/api/types";

/** Live counts shown next to nav items, keyed by the item's href. */
type NavBadges = Partial<Record<string, number>>;

function SidebarContent({
  user,
  badges,
  onNavigate,
}: {
  user: User;
  badges: NavBadges;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-6 px-4 py-6">
      <div className="px-2">
        <Logo />
      </div>

      <div className="flex flex-col items-center gap-2 border-b border-border pb-6 text-center">
        <Avatar name={user.name} src={user.avatar_url ?? undefined} className="size-16 text-lg" />
        <div>
          <p className="text-sm font-semibold text-foreground">{user.name}</p>
          <p className="text-xs font-medium text-primary">
            {user.role ? ROLE_LABEL[user.role] : user.role_title}
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {safetyNav.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const badge = badges[item.href];
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-[18px]" aria-hidden />
              <span className="flex-1">{item.label}</span>
              {badge !== undefined && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                    active
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-foreground text-surface",
                  )}
                >
                  {badge}
                  <span className="sr-only"> waiting</span>
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <form action={signOut}>
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger-surface"
        >
          <LogOut className="size-[18px]" aria-hidden />
          Logout
        </button>
      </form>
    </div>
  );
}

interface SafetyShellProps {
  children: ReactNode;
  /** The signed-in staff member, from the safety layout. */
  user: User;
  notifications: NotificationList;
  badges?: NavBadges;
}

export function SafetyShell({ children, user, notifications, badges = {} }: SafetyShellProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-surface lg:block print:!hidden">
        <div className="sticky top-0 h-screen">
          <SidebarContent user={user} badges={badges} />
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 w-72 bg-surface shadow-xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close navigation menu"
              className="absolute right-3 top-4 inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
            >
              <X className="size-5" />
            </button>
            <SidebarContent user={user} badges={badges} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6 lg:justify-end lg:px-8 print:!hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open navigation menu"
            className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted lg:hidden"
          >
            <Menu className="size-5" />
          </button>
          {user.role && <NotificationBell initial={notifications} role={user.role} />}
        </header>
        <main className="flex-1 px-4 pb-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
