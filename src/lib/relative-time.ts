import { formatDepotDate } from "./format";

/** "just now", "5m ago", "3h ago", "2d ago"; a week or more → "25th August, 2026". */
export function formatTimeAgo(timestamp: string, now: number = Date.now()): string {
  const minutes = Math.floor((now - new Date(timestamp).getTime()) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return days < 7 ? `${days}d ago` : formatDepotDate(timestamp);
}
