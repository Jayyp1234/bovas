"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

interface ChartFilterProps {
  /** Accessible name, e.g. "Trucks per Marketer: product". */
  label: string;
  /** The search param holding the choice. */
  param: string;
  value: string;
  options: { value: string; label: string }[];
  /** The value that needs no search param. */
  defaultValue?: string;
}

/** A compact dropdown that keeps its choice in the URL, so the server renders the chart for it. */
export function ChartFilter({ label, param, value, options, defaultValue = "" }: ChartFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function choose(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === defaultValue) {
      params.delete(param);
    } else {
      params.set(param, next);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <div className="relative inline-flex items-center">
      <select
        aria-label={label}
        value={value}
        onChange={(event) => choose(event.target.value)}
        className="appearance-none rounded-lg border border-border bg-surface py-1.5 pl-2.5 pr-7 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
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
