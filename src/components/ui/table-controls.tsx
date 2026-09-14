"use client";

import { useEffect, useState } from "react";
import { ArrowUpDown, ChevronDown, ChevronLeft, ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import { useUrlParams } from "@/lib/use-url-params";
import type { Period } from "@/lib/api/types";

/*
 * Controls for server-paged tables. Each one keeps its value in the URL; the page re-renders
 * on the server with the new query, so what's shown always matches the API.
 */

/** A search box that updates `?q=` a moment after typing stops. */
export function SearchInput({
  placeholder,
  label,
  className,
  param = "q",
}: {
  placeholder: string;
  label: string;
  className?: string;
  param?: string;
}) {
  const { get, update } = useUrlParams();
  const current = get(param) ?? "";
  const [value, setValue] = useState(current);

  useEffect(() => {
    if (value.trim() === current) return;
    const timer = window.setTimeout(() => update({ [param]: value.trim() || null }), 350);
    return () => window.clearTimeout(timer);
    // `update` changes identity every render; the comparison above keeps this from looping.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, current, param]);

  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
      <Input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="h-9 pl-9 text-xs"
      />
    </div>
  );
}

interface Option {
  value: string;
  label: string;
}

/** A Sort or Filter menu that stores its choice in a search param. */
export function ParamSelect({
  param,
  label,
  options,
  defaultValue = "",
  kind = "filter",
}: {
  param: string;
  /** Accessible name, e.g. "Sort tickets". */
  label: string;
  options: Option[];
  /** The value that needs no param. */
  defaultValue?: string;
  kind?: "sort" | "filter";
}) {
  const { get, update } = useUrlParams();
  const value = get(param) ?? defaultValue;
  const Icon = kind === "sort" ? ArrowUpDown : SlidersHorizontal;

  return (
    <div className="relative inline-flex items-center">
      <Icon className="pointer-events-none absolute left-2.5 size-3.5 text-muted-foreground" />
      <select
        aria-label={label}
        value={value}
        onChange={(event) => update({ [param]: event.target.value === defaultValue ? null : event.target.value })}
        className="h-9 appearance-none rounded-lg border border-border bg-surface pl-8 pr-7 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 size-3.5 text-muted-foreground" />
    </div>
  );
}

const PERIOD_LABEL: Record<Period, string> = {
  today: "Today",
  week: "This Week",
  month: "This Month",
  year: "This Year",
};

/**
 * Today / This Week / This Month / This Year, plus an Archive menu of past years. Stored as
 * `?period=` and `?year=`; picking one clears the other.
 */
export function PeriodFilter({
  years,
  periods = ["today", "week", "month", "year"],
  defaultPeriod = "today",
}: {
  years: number[];
  periods?: Period[];
  defaultPeriod?: Period;
}) {
  const { get, update } = useUrlParams();
  const year = get("year");
  const period = year ? null : (get("period") ?? defaultPeriod);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div role="group" aria-label="Period" className="inline-flex rounded-lg border border-border bg-surface p-0.5">
        {periods.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={period === option}
            onClick={() => update({ period: option === defaultPeriod ? null : option, year: null })}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              period === option ? "bg-foreground text-surface" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {PERIOD_LABEL[option]}
          </button>
        ))}
      </div>
      <div className="relative inline-flex items-center">
        <select
          aria-label="Archive year"
          value={year ?? ""}
          onChange={(event) => update({ year: event.target.value || null, period: null })}
          className={cn(
            "h-9 appearance-none rounded-lg border border-border bg-surface pl-3 pr-7 text-xs font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
            year ? "text-foreground" : "text-muted-foreground",
          )}
        >
          <option value="">Archive</option>
          {years.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 size-3.5 text-muted-foreground" />
      </div>
    </div>
  );
}

/** Tabs that store their choice in a search param, e.g. truck type. */
export function ParamTabs({
  param,
  label,
  tabs,
  defaultValue = "all",
  className,
}: {
  param: string;
  label: string;
  tabs: { key: string; label: string }[];
  defaultValue?: string;
  className?: string;
}) {
  const { get, update } = useUrlParams();
  const value = get(param) ?? defaultValue;

  return (
    <div role="tablist" aria-label={label} className={cn("flex gap-6", className)}>
      {tabs.map((tab) => {
        const active = value === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => update({ [param]: tab.key === defaultValue ? null : tab.key })}
            className={cn(
              "-mb-px border-b-2 py-3 text-sm font-medium transition-colors",
              active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

/** Page numbers to show: the first, the last, and the current page with its neighbours. */
function pageList(page: number, pages: number): (number | "gap")[] {
  const wanted = new Set([1, pages, page - 1, page, page + 1].filter((n) => n >= 1 && n <= pages));
  const sorted = [...wanted].sort((a, b) => a - b);
  return sorted.flatMap((n, index) => (index > 0 && n - sorted[index - 1] > 1 ? ["gap" as const, n] : [n]));
}

/** "Showing 21–40 of 134 tickets" with Previous, page numbers and Next, stored as `?page=`. */
export function Pagination({
  page,
  perPage,
  total,
  noun,
}: {
  page: number;
  perPage: number;
  total: number;
  /** What's being counted, e.g. "tickets". */
  noun: string;
}) {
  const { update, pending } = useUrlParams();
  const pages = Math.max(1, Math.ceil(total / perPage));
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(total, page * perPage);
  const go = (next: number) => update({ page: next === 1 ? null : next });

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t border-border px-5 py-4 text-xs text-muted-foreground transition-opacity sm:flex-row sm:items-center sm:justify-between",
        pending && "opacity-60",
      )}
    >
      <p aria-live="polite">
        Showing {formatNumber(from)}–{formatNumber(to)} of {formatNumber(total)} {noun}
      </p>
      {pages > 1 && (
        <nav aria-label="Pagination" className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => go(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
            className="inline-flex size-8 items-center justify-center rounded-md transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
          </button>
          {pageList(page, pages).map((item, index) =>
            item === "gap" ? (
              <span key={`gap-${index}`} className="px-1" aria-hidden>
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => go(item)}
                aria-current={item === page ? "page" : undefined}
                className={cn(
                  "size-8 rounded-md text-sm transition-colors",
                  item === page ? "bg-primary font-semibold text-primary-foreground" : "hover:bg-muted",
                )}
              >
                {item}
              </button>
            ),
          )}
          <button
            type="button"
            onClick={() => go(page + 1)}
            disabled={page >= pages}
            aria-label="Next page"
            className="inline-flex size-8 items-center justify-center rounded-md transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronRight className="size-4" />
          </button>
        </nav>
      )}
    </div>
  );
}
