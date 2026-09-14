import { formatLongDate } from "@/lib/format";
import type { ChartPoint, DashboardStats, Terminal, TicketDetail } from "@/lib/api/types";
import { MarketerChart, type ChartFilters } from "@/features/dashboard/components/marketer-chart";
import { OperationsOverview } from "@/features/dashboard/components/operations-overview";
import { OverloadApprovals } from "./overload-approvals";
import { UploadProgramDialog } from "./upload-program-dialog";

interface ChartData extends ChartFilters {
  data: ChartPoint[];
}

interface AdminDashboardProps {
  /** The signed-in admin's first name. */
  name: string;
  stats: DashboardStats;
  trucks: ChartData;
  litres: ChartData;
  /** Overloaded trucks waiting for a decision. */
  overloads: TicketDetail[];
  terminals: Terminal[];
  /** The admin's own terminal, preselected for uploads. */
  defaultTerminalId: number;
  /** Today at the depot, as YYYY-MM-DD. */
  today: string;
}

export function AdminDashboard({
  name,
  stats,
  trucks,
  litres,
  overloads,
  terminals,
  defaultTerminalId,
  today,
}: AdminDashboardProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Welcome, {name}!
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatLongDate(new Date())}
          </p>
        </div>
        <UploadProgramDialog
          terminals={terminals}
          defaultTerminalId={defaultTerminalId}
          today={today}
        />
      </div>

      <OverloadApprovals tickets={overloads} />

      <OperationsOverview stats={stats} showDispatched />

      <div className="grid gap-4 lg:grid-cols-2">
        <MarketerChart
          title="Trucks per Marketer"
          data={trucks.data}
          filterKey="trucks"
          period={trucks.period}
          product={trucks.product}
        />
        <MarketerChart
          title="Quantity Requested per Marketer (000 L)"
          data={litres.data}
          filterKey="litres"
          period={litres.period}
          product={litres.product}
        />
      </div>
    </div>
  );
}
