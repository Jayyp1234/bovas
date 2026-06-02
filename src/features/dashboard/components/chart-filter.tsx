import { ChevronDown } from "lucide-react";

/**
 * Compact dropdown affordance for chart filters (Product / Daily).
 * Visual placeholder — not yet wired to filtering logic.
 */
export function ChartFilter({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
    >
      {label}
      <ChevronDown className="size-3.5" />
    </button>
  );
}
