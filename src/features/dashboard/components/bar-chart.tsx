import type { MarketerDatum } from "../types";

interface BarChartProps {
  data: MarketerDatum[];
  /** Plot height in pixels. */
  height?: number;
}

const TICK_COUNT = 5;

/** Round a value up to a "nice" axis ceiling (e.g. 70 → 80, 134 → 200). */
function niceCeiling(value: number): number {
  if (value <= 0) return TICK_COUNT;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / magnitude) * magnitude;
}

/**
 * Lightweight, dependency-free bar chart.
 * Swap for a charting library later if richer interactions are needed.
 */
export function BarChart({ data, height = 220 }: BarChartProps) {
  const ceiling = niceCeiling(Math.max(0, ...data.map((d) => d.value)));
  const ticks = Array.from({ length: TICK_COUNT + 1 }, (_, i) =>
    Math.round((ceiling / TICK_COUNT) * (TICK_COUNT - i)),
  );

  return (
    <div className="flex gap-3">
      <div
        className="flex flex-col justify-between text-right text-[10px] text-subtle"
        style={{ height }}
        aria-hidden
      >
        {ticks.map((tick) => (
          <span key={tick}>{tick}</span>
        ))}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-end gap-2 sm:gap-3" style={{ height }}>
          {data.map((datum) => (
            <div key={datum.marketer} className="flex flex-1 items-end">
              <div
                className="w-full rounded-t-md bg-chart transition-[height]"
                style={{ height: (datum.value / ceiling) * height }}
                title={`${datum.marketer}: ${datum.value}`}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-2 sm:gap-3">
          {data.map((datum) => (
            <span
              key={datum.marketer}
              className="flex-1 truncate text-center text-[10px] text-muted-foreground"
            >
              {datum.marketer}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
