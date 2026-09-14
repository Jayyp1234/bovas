import "server-only";
import { getCurrentUser } from "@/lib/auth/current-user";
import { apiRequest, fromApi, isLive } from "./client";
import * as mock from "./mock/notifications";
import type { NotificationList, NotificationQuery } from "./types";

/** The build phase that implements notifications (x-phase in openapi.yaml). */
const PHASE = 6;

const EMPTY: NotificationList = { data: [], meta: { unread: 0 } };

/** Your latest 50 notifications, newest first, with the unread count. `GET /api/notifications` */
export function listNotifications(query: NotificationQuery = {}): Promise<NotificationList> {
  return fromApi<NotificationList>(
    PHASE,
    () => apiRequest("/api/notifications", { query }),
    async () => {
      const user = await getCurrentUser();
      return user ? mock.listNotifications(user, query) : EMPTY;
    },
  );
}

/** Marks these notifications as read, or all of them for null. `POST /api/notifications/read` */
export async function markNotificationsRead(ids: number[] | null): Promise<void> {
  if (isLive(PHASE)) {
    await apiRequest("/api/notifications/read", { method: "POST", body: { ids } });
    return;
  }

  const user = await getCurrentUser();
  if (user) mock.markNotificationsRead(user, ids);
}
