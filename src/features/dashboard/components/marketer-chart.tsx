import { Card } from "@/components/ui/card";
import type { ChartPoint, Period, Product } from "@/lib/api/types";
import { BarChart } from "./bar-chart";
import { ChartFilter } from "./chart-filter";

export interface ChartFilters {
  period: Period;
  /** All products when unset. */
  product?: Product;
}

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "today", label: "Daily" },
  { value: "week", label: "Weekly" },
  { value: "month", label: "Monthly" },
  { value: "year", label: "Yearly" },
];

const PRODUCTS: Product[] = ["PMS", "AGO", "DPK"];

const PRODUCT_OPTIONS = [
  { value: "", label: "All Products" },
  ...PRODUCTS.map((product) => ({ value: product, label: product })),
];

/** One chart's filters from the page's search params, e.g. `trucks_product=AGO&trucks_period=week`. */
export function readChartFilters(
  params: Record<string, string | string[] | undefined>,
  key: string,
): ChartFilters {
  return {
    period: PERIOD_OPTIONS.find((option) => option.value === params[`${key}_period`])?.value ?? "today",
    product: PRODUCTS.find((product) => product === params[`${key}_product`]),
  };
}

interface MarketerChartProps extends ChartFilters {
  title: string;
  data: ChartPoint[];
  /** Prefix for this chart's search params, so each chart filters on its own. */
  filterKey: string;
}

export function MarketerChart({ title, data, filterKey, period, product }: MarketerChartProps) {
  return (
    <Card className="p-5">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <div className="flex items-center gap-2">
          <ChartFilter
            label={`${title}: product`}
            param={`${filterKey}_product`}
            value={product ?? ""}
            options={PRODUCT_OPTIONS}
          />
          <ChartFilter
            label={`${title}: period`}
            param={`${filterKey}_period`}
            value={period}
            options={PERIOD_OPTIONS}
            defaultValue="today"
          />
        </div>
      </div>
      {data.length > 0 ? (
        <BarChart data={data} />
      ) : (
        <p className="flex h-[244px] items-center justify-center text-sm text-muted-foreground">
          No tickets for this period yet.
        </p>
      )}
    </Card>
  );
}
