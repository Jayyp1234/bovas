/** Building CSV downloads the same way bovas-api does. */
import { DEPOT_TIME_ZONE } from "@/lib/format";

type Cell = string | number | null | undefined;

/** Text a spreadsheet would run as a formula gets an apostrophe; commas, quotes and newlines are quoted. */
function cell(value: Cell): string {
  if (value === null || value === undefined) return "";
  const text = typeof value === "string" && /^[=+\-@\t\r]/.test(value) ? `'${value}` : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** A CSV file with a byte-order mark, so Excel opens it as UTF-8. */
export function toCsv(lines: Cell[][]): string {
  return `﻿${lines.map((line) => line.map(cell).join(",")).join("\r\n")}\r\n`;
}

/** The depot date of a timestamp as YYYY-MM-DD; today when none is given. */
export function depotIsoDate(timestamp: string | Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: DEPOT_TIME_ZONE }).format(new Date(timestamp));
}

/** "today", "week", "2025" — the time filter, for file names. */
export function scopeLabel(time: { period?: string; year?: number }): string {
  return time.year ? String(time.year) : (time.period ?? "all-time");
}

/** A route handler response that downloads the CSV. */
export function csvDownload(filename: string, csv: string): Response {
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename.replace(/["\r\n]/g, "")}"`,
      "Cache-Control": "no-store",
    },
  });
}
