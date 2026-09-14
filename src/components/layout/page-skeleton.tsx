/** A neutral placeholder while a workspace page loads: heading, stat cards and a table. */
export function PageSkeleton() {
  return (
    <div role="status" aria-live="polite" className="flex animate-pulse flex-col gap-6 motion-reduce:animate-none">
      <span className="sr-only">Loading…</span>
      <div className="h-7 w-48 rounded-lg bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-28 rounded-2xl border border-border bg-surface" />
        ))}
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="h-14 border-b border-border" />
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex gap-4 border-b border-border px-5 py-4 last:border-0">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-4 flex-1 rounded bg-muted" />
            <div className="hidden h-4 w-32 rounded bg-muted sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
