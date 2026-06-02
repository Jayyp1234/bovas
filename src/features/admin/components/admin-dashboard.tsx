import { Ticket, Hourglass, CircleCheckBig, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatLongDate } from "@/lib/format";
import { StatCard } from "@/features/dashboard/components/stat-card";
import { MarketerChart } from "@/features/dashboard/components/marketer-chart";
import {
  trucksPerMarketer,
  quantityPerMarketer,
} from "@/features/dashboard/data/charts";

const stats = [
  {
    label: "Generated Tickets",
    value: 134,
    hint: "Last generated 14:06",
    icon: Ticket,
  },
  { label: "Pending Tickets", value: 8, icon: Hourglass },
  { label: "Approved for Loading", value: 126, icon: CircleCheckBig },
  { label: "Trucks Dispatched", value: 80, icon: Truck },
];

export function AdminDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Welcome, Olayinka!
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatLongDate(new Date())}
          </p>
        </div>
        <Button className="self-start sm:self-auto">Upload Loading Program</Button>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Operations Overview
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
              hint={stat.hint}
            />
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <MarketerChart title="Trucks per Marketer" data={trucksPerMarketer} />
        <MarketerChart
          title="Quantity Requested per Marketer"
          data={quantityPerMarketer}
        />
      </div>
    </div>
  );
}
