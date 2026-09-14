/** Locale-aware number/date formatting helpers. */

const numberFormatter = new Intl.NumberFormat("en-US");

/** Depot operations run on Lagos time, whatever timezone the server or browser is in. */
export const DEPOT_TIME_ZONE = "Africa/Lagos";

/** 45000 → "45,000" */
export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

/** 45000 → "45,000 Litres" */
export function formatLitres(value: number): string {
  return `${formatNumber(value)} Litres`;
}

/** 500 → "+500 Litres", -120 → "-120 Litres", 0 → "0 Litres" */
export function formatVariance(litres: number): string {
  return `${litres > 0 ? "+" : ""}${formatLitres(litres)}`;
}

/** Ordinal suffix for a day of month: 1 → "st", 14 → "th". */
function ordinalSuffix(day: number): string {
  const suffixes = ["th", "st", "nd", "rd"];
  const remainder = day % 100;
  return suffixes[(remainder - 20) % 10] ?? suffixes[remainder] ?? suffixes[0];
}

/** Date → "Monday, 14th January, 2026" (matches the dashboard greeting). */
export function formatLongDate(date: Date): string {
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  const month = date.toLocaleDateString("en-US", { month: "long" });
  const day = date.getDate();
  return `${weekday}, ${day}${ordinalSuffix(day)} ${month}, ${date.getFullYear()}`;
}

/**
 * An API date ("2026-08-25") or timestamp ("2026-08-25T07:12:00Z") → "25th August, 2026".
 * Timestamps are read in Lagos time, so the result is the same on server and client.
 */
export function formatDepotDate(value: string): string {
  const [year, month, day] = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? value.split("-").map(Number)
    : new Intl.DateTimeFormat("en-CA", {
        timeZone: DEPOT_TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
        .format(new Date(value))
        .split("-")
        .map(Number);

  const monthName = new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-US", {
    month: "long",
    timeZone: "UTC",
  });
  return `${day}${ordinalSuffix(day)} ${monthName}, ${year}`;
}

/** "2026-08-25T13:06:00Z" → "14:06" in Lagos time. */
export function formatDepotTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString("en-GB", {
    timeZone: DEPOT_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
}
