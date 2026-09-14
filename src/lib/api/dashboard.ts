import "server-only";
import { apiRequest, fromApi } from "./client";
import * as mock from "./mock/dashboard";
import type { DashboardCharts, DashboardChartsQuery, DashboardStats } from "./types";

/** Today's operations overview. `GET /api/dashboard/stats` (phase 3) */
export function getDashboardStats(): Promise<DashboardStats> {
  return fromApi<DashboardStats>(
    3,
    () => apiRequest("/api/dashboard/stats"),
    () => mock.getDashboardStats(),
  );
}

/** Trucks and litres per marketer. `GET /api/dashboard/charts` (phase 3) */
export function getDashboardCharts(query: DashboardChartsQuery = {}): Promise<DashboardCharts> {
  return fromApi<DashboardCharts>(
    3,
    () => apiRequest("/api/dashboard/charts", { query }),
    () => mock.getDashboardCharts(),
  );
}
