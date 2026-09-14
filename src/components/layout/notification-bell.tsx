"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  CircleCheck,
  CircleX,
  ClipboardList,
  FileText,
  LifeBuoy,
  Scale,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTimeAgo } from "@/lib/relative-time";
import { notificationHref } from "@/domain/notifications";
import { markNotificationsReadAction, refreshNotificationsAction } from "@/features/notifications/actions";
import type { AppNotification, NotificationList, NotificationType, Role } from "@/lib/api/types";

/** How often the bell checks for new notifications while the tab is visible. */
const POLL_INTERVAL_MS = 30_000;

const ICON: Record<NotificationType, { icon: LucideIcon; tone: string }> = {
  ticket_approved: { icon: CircleCheck, tone: "bg-success-surface text-success" },
  ticket_rejected: { icon: CircleX, tone: "bg-danger-surface text-danger" },
  program_uploaded: { icon: ClipboardList, tone: "bg-primary/15 text-primary" },
  overload_requested: { icon: TriangleAlert, tone: "bg-warning-surface text-warning" },
  overload_decided: { icon: Scale, tone: "bg-primary/15 text-primary" },
  waybill_issued: { icon: FileText, tone: "bg-primary/15 text-primary" },
  support_request: { icon: LifeBuoy, tone: "bg-primary/15 text-primary" },
};

/** The list with these notifications (all for null) marked read now, before the server confirms. */
function markedRead(feed: NotificationList, ids: number[] | null): NotificationList {
  const readAt = new Date().toISOString();
  const affected = (notification: AppNotification) =>
    notification.read_at === null && (ids === null || ids.includes(notification.id));

  return {
    data: feed.data.map((notification) => (affected(notification) ? { ...notification, read_at: readAt } : notification)),
    meta: { unread: Math.max(0, feed.meta.unread - feed.data.filter(affected).length) },
  };
}

interface NotificationBellProps {
  /** The feed as the layout rendered it. */
  initial: NotificationList;
  role: Role;
  /** Which side of the button the panel lines up with. */
  align?: "start" | "end";
}

export function NotificationBell({ initial, role, align = "end" }: NotificationBellProps) {
  const router = useRouter();
  const [feed, setFeed] = useState(initial);
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const container = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      startTransition(async () => {
        const next = await refreshNotificationsAction();
        if (next) setFeed(next);
      });
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!open) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      button.current?.focus();
    }
    function closeOnOutsideClick(event: PointerEvent) {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOnOutsideClick);
    };
  }, [open]);

  function markRead(ids: number[] | null) {
    setFeed((current) => markedRead(current, ids));
    startTransition(async () => {
      const next = await markNotificationsReadAction(ids);
      if (next) setFeed(next);
    });
  }

  function openNotification(notification: AppNotification) {
    if (notification.read_at === null) markRead([notification.id]);

    const href = notificationHref(notification, role);
    if (href) {
      setOpen(false);
      router.push(href);
    }
  }

  const unread = feed.meta.unread;

  return (
    <div ref={container} className="relative">
      <button
        ref={button}
        type="button"
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="relative inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
      >
        <Bell className="size-5" aria-hidden />
        {unread > 0 && (
          <span
            aria-hidden
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold leading-none text-on-solid"
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          id={panelId}
          role="region"
          aria-label="Notifications"
          className={cn(
            "absolute top-11 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-surface shadow-lg",
            align === "end" ? "right-0" : "left-0",
          )}
        >
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">
              Notifications
              {unread > 0 && <span className="ml-1.5 font-normal text-muted-foreground">{unread} unread</span>}
            </p>
            <button
              type="button"
              onClick={() => markRead(null)}
              disabled={unread === 0}
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            >
              <CheckCheck className="size-3.5" aria-hidden />
              Mark all as read
            </button>
          </div>

          {feed.data.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">You&apos;re all caught up.</p>
          ) : (
            <ul className="max-h-96 overflow-y-auto">
              {feed.data.map((notification) => {
                const { icon: Icon, tone } = ICON[notification.type];
                const isUnread = notification.read_at === null;
                return (
                  <li key={notification.id} className="border-b border-border last:border-0">
                    <button
                      type="button"
                      onClick={() => openNotification(notification)}
                      className={cn(
                        "flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60",
                        isUnread && "bg-primary/5",
                      )}
                    >
                      <span className={cn("mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full", tone)}>
                        <Icon className="size-4" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={cn("block text-sm text-foreground", isUnread && "font-medium")}>
                          {notification.title}
                        </span>
                        <time
                          dateTime={notification.created_at}
                          suppressHydrationWarning
                          className="mt-0.5 block text-xs text-muted-foreground"
                        >
                          {formatTimeAgo(notification.created_at)}
                        </time>
                      </span>
                      {isUnread && (
                        <span className="mt-2 size-2 shrink-0 rounded-full bg-primary">
                          <span className="sr-only">Unread</span>
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
