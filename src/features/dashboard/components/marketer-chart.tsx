import { Card } from "@/components/ui/card";
import { BarChart } from "./bar-chart";
import { ChartFilter } from "./chart-filter";
import type { MarketerDatum } from "../types";

interface MarketerChartProps {
  title: string;
  data: MarketerDatum[];
}

export function MarketerChart({ title, data }: MarketerChartProps) {
  return (
    <Card className="p-5">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <div className="flex items-center gap-2">
          <ChartFilter label="Product" />
          <ChartFilter label="Daily" />
        </div>
      </div>
      <BarChart data={data} />
    </Card>
  );
}
