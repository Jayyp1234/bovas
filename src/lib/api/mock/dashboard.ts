import type { ChartPoint, DashboardCharts, DashboardStats } from "../types";
import { at } from "./shared";

export async function getDashboardStats(): Promise<DashboardStats> {
  return {
    generated_tickets: 134,
    pending_tickets: 8,
    approved_for_loading: 126,
    trucks_dispatched: 80,
    last_generated_at: at("13:06"),
  };
}

function series(values: Record<string, number>): ChartPoint[] {
  return Object.entries(values).map(([label, value]) => ({ label, value }));
}

/** `product` and `period` are ignored: the chart fixtures are fixed day totals. */
export async function getDashboardCharts(): Promise<DashboardCharts> {
  return {
    trucks_per_marketer: series({
      BOVAS: 70,
      FATGBEMS: 48,
      TEPATH: 55,
      "B/TUNDE": 42,
      "JOJO M": 50,
      "JOTS M": 12,
      TECHNO: 18,
      HCREST: 30,
    }),
    quantity_per_marketer: series({
      BOVAS: 74,
      FATGBEMS: 50,
      TEPATH: 38,
      "B/TUNDE": 46,
      "JOJO M": 52,
      "JOTS M": 14,
      TECHNO: 20,
      HCREST: 33,
    }),
  };
}
