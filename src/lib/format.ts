/** Locale-aware number/date formatting helpers. */

const numberFormatter = new Intl.NumberFormat("en-US");

/** 45000 → "45,000" */
export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

/** 45000 → "45,000 Litres" */
export function formatLitres(value: number): string {
  return `${formatNumber(value)} Litres`;
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
