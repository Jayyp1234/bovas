import type { AppNotification, NotificationList, NotificationQuery, NotificationType, Role, User } from "../types";
import { nowTimestamp } from "./shared";

/*
 * Notifications in demo mode go to a whole role rather than a person, and each demo account keeps
 * its own read marks.
 */

interface Stored {
  role: Role;
  notification: Omit<AppNotification, "read_at">;
}

const LIMIT = 50;

const stored: Stored[] = [];
let nextId = 1;

/** Staff number → notification ID → when it was read. */
const readMarks = new Map<string, Map<number, string>>();

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString().replace(/\.\d{3}Z$/, "Z");
}

export function notifyRole(role: Role, type: NotificationType, title: string, ticketNo: string | null = null): void {
  stored.push({ role, notification: { id: nextId++, type, title, ticket_no: ticketNo, created_at: nowTimestamp() } });
}

function sample(role: Role, type: NotificationType, title: string, ticketNo: string | null, minutes: number): void {
  stored.push({ role, notification: { id: nextId++, type, title, ticket_no: ticketNo, created_at: minutesAgo(minutes) } });
}

sample("logistics", "program_uploaded", "Olayinka Fagboore uploaded the loading program for Terminal 1.", null, 180);
sample("logistics", "ticket_approved", "Loading ticket #24989001 was approved by Safety.", "24989001", 135);
sample("logistics", "ticket_rejected", "Loading ticket #24989003 was rejected by Safety: PPE not worn.", "24989003", 80);
sample("logistics", "waybill_issued", "Waybill A1234567 was issued for loading ticket #24989001.", "24989001", 100);
sample("admin", "overload_requested", "Truck BDJ590XA on ticket #24989002 loaded 45,900 litres against 45,000 requested and needs overload approval.", "24989002", 85);
sample("admin", "support_request", "Modupe Johnson asked for help: Waybill printer at the gate", null, 40);
sample("dispatch", "overload_decided", "Olayinka Fagboore approved the overload on ticket #24989004.", "24989004", 30);

export async function listNotifications(user: User, query: NotificationQuery = {}): Promise<NotificationList> {
  const marks = readMarks.get(user.staff_no) ?? new Map<number, string>();
  const mine = stored
    .filter((entry) => entry.role === user.role)
    .map(({ notification }) => ({ ...notification, read_at: marks.get(notification.id) ?? null }))
    .sort((a, b) => b.created_at.localeCompare(a.created_at) || b.id - a.id);

  return {
    data: mine.filter((notification) => !query.unread || notification.read_at === null).slice(0, LIMIT),
    meta: { unread: mine.filter((notification) => notification.read_at === null).length },
  };
}

export function markNotificationsRead(user: User, ids: number[] | null): void {
  const marks = readMarks.get(user.staff_no) ?? new Map<number, string>();
  const readAt = nowTimestamp();

  for (const { role, notification } of stored) {
    if (role === user.role && (ids === null || ids.includes(notification.id)) && !marks.has(notification.id)) {
      marks.set(notification.id, readAt);
    }
  }
  readMarks.set(user.staff_no, marks);
}
