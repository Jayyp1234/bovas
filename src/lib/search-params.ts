/**
 * Reading list filters from a page's search params. Tables keep their state in the URL
 * (`?q=&period=&year=&page=`), so a filtered view can be refreshed, shared and paged on the server.
 */
import { DEPOT_TIME_ZONE } from "@/lib/format";
import type { Period } from "@/lib/api/types";

export type SearchParams = Record<string, string | string[] | undefined>;

export const PERIODS: readonly Period[] = ["today", "week", "month", "year"];

/** The first value of a param, trimmed; undefined when missing or blank. */
export function textParam(params: SearchParams, key: string): string | undefined {
  const raw = params[key];
  const value = (Array.isArray(raw) ? raw[0] : raw)?.trim();
  return value ? value : undefined;
}

/** A whole number of at least `min`, or undefined. */
export function intParam(params: SearchParams, key: string, min = 1): number | undefined {
  const value = textParam(params, key);
  if (!value || !/^\d+$/.test(value)) return undefined;
  const number = Number(value);
  return number >= min ? number : undefined;
}

/** The param when it's one of `allowed`, otherwise undefined. */
export function oneOfParam<T extends string>(params: SearchParams, key: string, allowed: readonly T[]): T | undefined {
  const value = textParam(params, key);
  return allowed.find((option) => option === value);
}

/**
 * The time filter: an archive `year`, or a `period` (today unless the table shows all time).
 * A year wins over a period, as it does in the API.
 */
export function timeParams(
  params: SearchParams,
  defaultPeriod: Period | undefined = "today",
): { period?: Period; year?: number } {
  const year = intParam(params, "year", 2020);
  return year ? { year } : { period: oneOfParam(params, "period", PERIODS) ?? defaultPeriod };
}

/** The four years before this one at the depot, newest first, for the Archive menu. */
export function archiveYears(): number[] {
  const thisYear = Number(new Intl.DateTimeFormat("en-CA", { timeZone: DEPOT_TIME_ZONE, year: "numeric" }).format(new Date()));
  return Array.from({ length: 4 }, (_, index) => thisYear - 1 - index);
}
