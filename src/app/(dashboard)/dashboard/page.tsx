import type { Metadata } from "next";
import { DashboardGreeting } from "@/features/dashboard/components/dashboard-greeting";
import { OperationsOverview } from "@/features/dashboard/components/operations-overview";
import { MarketerChart, readChartFilters } from "@/features/dashboard/components/marketer-chart";
import { LoadingTicketsTable } from "@/features/dashboard/components/loading-tickets-table";
import { getDashboardCharts, getDashboardStats } from "@/lib/api/dashboard";
import { listTickets } from "@/lib/api/tickets";
import { requireRole } from "@/lib/auth/current-user";

export const metadata: Metadata = {
  title: "Dashboard",
};

interface DashboardPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const trucks = readChartFilters(params, "trucks");
  const litres = readChartFilters(params, "litres");

  const [user, stats, trucksChart, litresChart, tickets] = await Promise.all([
    requireRole("logistics"),
    getDashboardStats(),
    getDashboardCharts(trucks),
    getDashboardCharts(litres),
    listTickets({ period: "today", sort: "created_at", per_page: 100 }),
  ]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <DashboardGreeting name={user.name.split(" ")[0]} date={new Date()} />

      <OperationsOverview stats={stats} />

      <div className="grid gap-4 lg:grid-cols-2">
        <MarketerChart
          title="Trucks per Marketer"
          data={trucksChart.trucks_per_marketer}
          filterKey="trucks"
          period={trucks.period}
          product={trucks.product}
        />
        <MarketerChart
          title="Quantity Requested per Marketer (000 L)"
          data={litresChart.quantity_per_marketer}
          filterKey="litres"
          period={litres.period}
          product={litres.product}
        />
      </div>

      <LoadingTicketsTable tickets={tickets.data} />
    </div>
  );
}
