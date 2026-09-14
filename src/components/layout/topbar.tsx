"use client";

import { Menu } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { NotificationBell } from "@/components/layout/notification-bell";
import { ROLE_LABEL } from "@/domain/roles";
import type { NotificationList, User } from "@/lib/api/types";

interface TopbarProps {
  user: User;
  notifications: NotificationList;
  onMenuClick: () => void;
}

export function Topbar({ user, notifications, onMenuClick }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-surface/80 px-4 backdrop-blur sm:px-6 print:!hidden">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
        className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
        {user.role && <NotificationBell initial={notifications} role={user.role} />}

        <div className="flex items-center gap-2.5">
          <Avatar name={user.name} src={user.avatar_url ?? undefined} />
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-semibold text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">
              {user.role ? ROLE_LABEL[user.role] : user.role_title}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
