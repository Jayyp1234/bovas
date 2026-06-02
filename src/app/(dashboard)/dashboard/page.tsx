import type { Metadata } from "next";
import { DashboardGreeting } from "@/features/dashboard/components/dashboard-greeting";
import { OperationsOverview } from "@/features/dashboard/components/operations-overview";
import { MarketerChart } from "@/features/dashboard/components/marketer-chart";
import { LoadingTicketsTable } from "@/features/dashboard/components/loading-tickets-table";
import {
  trucksPerMarketer,
  quantityPerMarketer,
} from "@/features/dashboard/data/charts";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      {/* Greeting uses the current date; swap for session data when auth lands. */}
      <DashboardGreeting name="Olateju" date={new Date()} />

      <OperationsOverview />

      <div className="grid gap-4 lg:grid-cols-2">
        <MarketerChart title="Trucks per Marketer" data={trucksPerMarketer} />
        <MarketerChart
          title="Quantity Requested per Marketer"
          data={quantityPerMarketer}
        />
      </div>

      <LoadingTicketsTable />
    </div>
  );
}
