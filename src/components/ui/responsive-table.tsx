"use client";

import { useEffect, useRef, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * A table that becomes a list of cards below 640px (see `.table-cards` in globals.css). It
 * copies each column heading onto its cells as data-label, and again whenever rows change.
 */
export function ResponsiveTable({ className, ...props }: ComponentProps<"table">) {
  const ref = useRef<HTMLTableElement>(null);

  useEffect(() => {
    const table = ref.current;
    if (!table) return;

    function label() {
      const headings = Array.from(table!.querySelectorAll("thead th"), (th) => th.textContent?.trim() ?? "");
      for (const row of Array.from(table!.querySelectorAll("tbody tr"))) {
        Array.from(row.children).forEach((cell, index) => {
          if (cell instanceof HTMLTableCellElement && cell.colSpan === 1 && cell.dataset.label !== headings[index]) {
            cell.dataset.label = headings[index] ?? "";
          }
        });
      }
    }

    label();
    // Only added or removed rows re-run this; setting data-label doesn't trigger it again.
    const observer = new MutationObserver(label);
    observer.observe(table, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return <table ref={ref} className={cn("table-cards", className)} {...props} />;
}
