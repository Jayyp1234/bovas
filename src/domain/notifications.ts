/** Where a notification leads for each role. Safe for client components. */
import type { AppNotification, Role } from "@/lib/api/types";

const TICKET_PAGE: Record<Role, ((ticketNo: string) => string) | null> = {
  admin: (ticketNo) => `/admin/audit/${ticketNo}`,
  logistics: (ticketNo) => `/ticket-history/${ticketNo}`,
  safety: (ticketNo) => `/safety/history/${ticketNo}`,
  dispatch: null,
};

/** The page that deals with the notification, or null when there's nothing to open. */
export function notificationHref(notification: AppNotification, role: Role): string | null {
  switch (notification.type) {
    case "support_request":
      return role === "admin" ? "/admin/support" : null;
    case "overload_requested":
      return role === "admin" ? "/admin/dashboard" : null;
    case "program_uploaded":
      return role === "logistics" ? "/loading-program" : null;
    case "overload_decided":
      return role === "dispatch" ? "/dispatch/waybills" : null;
  }

  const ticketPage = TICKET_PAGE[role];
  return notification.ticket_no && ticketPage ? ticketPage(notification.ticket_no) : null;
}
