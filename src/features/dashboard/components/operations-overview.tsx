import { Ticket, Hourglass, CircleCheckBig } from "lucide-react";
import { StatCard } from "./stat-card";

export interface OperationsOverviewProps {
  generated: number;
  pending: number;
  approved: number;
  lastGeneratedHint?: string;
}

export function OperationsOverview({
  generated,
  pending,
  approved,
  lastGeneratedHint,
}: OperationsOverviewProps) {
  const stats = [
    {
      label: "Generated Tickets",
      value: generated,
      hint: lastGeneratedHint,
      icon: Ticket,
    },
    { label: "Pending Tickets", value: pending, icon: Hourglass },
    {
      label: "Approved for Loading",
      value: approved,
      icon: CircleCheckBig,
    },
  ];

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-foreground">
        Operations Overview
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
  );
}
