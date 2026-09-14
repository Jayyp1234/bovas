import { CircleCheckBig, Hourglass, Ticket, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDepotTime } from "@/lib/format";
import type { DashboardStats } from "@/lib/api/types";
import { StatCard } from "./stat-card";

interface OperationsOverviewProps {
  stats: DashboardStats;
  /** Admins also see how many trucks have left the depot. */
  showDispatched?: boolean;
}

export function OperationsOverview({ stats, showDispatched = false }: OperationsOverviewProps) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-foreground">
        Operations Overview
      </h2>
      <div
        className={cn(
          "grid gap-4 sm:grid-cols-2",
          showDispatched ? "lg:grid-cols-4" : "lg:grid-cols-3",
        )}
      >
        <StatCard
          icon={Ticket}
          label="Generated Tickets"
          value={stats.generated_tickets}
          hint={
            stats.last_generated_at
              ? `Last generated ${formatDepotTime(stats.last_generated_at)}`
              : undefined
          }
        />
        <StatCard icon={Hourglass} label="Pending Tickets" value={stats.pending_tickets} />
        <StatCard
          icon={CircleCheckBig}
          label="Approved for Loading"
          value={stats.approved_for_loading}
        />
        {showDispatched && (
          <StatCard icon={Truck} label="Trucks Dispatched" value={stats.trucks_dispatched} />
        )}
      </div>
    </section>
  );
}
