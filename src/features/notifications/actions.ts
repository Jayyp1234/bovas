"use server";

import { unstable_rethrow } from "next/navigation";
import { listNotifications, markNotificationsRead } from "@/lib/api/notifications";
import type { NotificationList } from "@/lib/api/types";

/*
 * The bell polls these. A failure returns null and the bell keeps what it has; an ended session
 * still redirects to sign in.
 */

export async function refreshNotificationsAction(): Promise<NotificationList | null> {
  try {
    return await listNotifications();
  } catch (error) {
    unstable_rethrow(error);
    console.error(error);
    return null;
  }
}

/** Marks notifications as read (all of them for null) and returns the updated list. */
export async function markNotificationsReadAction(ids: number[] | null): Promise<NotificationList | null> {
  try {
    await markNotificationsRead(ids);
    return await listNotifications();
  } catch (error) {
    unstable_rethrow(error);
    console.error(error);
    return null;
  }
}
