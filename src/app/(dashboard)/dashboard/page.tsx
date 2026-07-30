import type { Metadata } from "next";
import { DashboardGreeting } from "@/features/dashboard/components/dashboard-greeting";
import { OperationsOverview } from "@/features/dashboard/components/operations-overview";
import { MarketerChart } from "@/features/dashboard/components/marketer-chart";
import { LoadingTicketsTable } from "@/features/dashboard/components/loading-tickets-table";
import {
  getLoadingTickets,
  getMarketerCharts,
  getOperationsCounts,
} from "@/features/dashboard/data/queries";
import { getCurrentProfile } from "@/lib/auth/profile";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const [tickets, charts, profile] = await Promise.all([
    getLoadingTickets(),
    getMarketerCharts(),
    getCurrentProfile(),
  ]);
  const counts = await getOperationsCounts(tickets);
  const firstName = profile?.full_name?.split(" ")[0] ?? "Olateju";

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <DashboardGreeting name={firstName} date={new Date()} />

      <OperationsOverview
        generated={counts.generated}
        pending={counts.pending}
        approved={counts.approved}
        lastGeneratedHint={counts.lastGeneratedHint}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <MarketerChart title="Trucks per Marketer" data={charts.trucks} />
        <MarketerChart
          title="Quantity Requested per Marketer"
          data={charts.quantity}
        />
      </div>

      <LoadingTicketsTable tickets={tickets} />
    </div>
  );
}
