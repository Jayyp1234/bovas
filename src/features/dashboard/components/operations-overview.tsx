import { StatCard } from "./stat-card";
import { operationsStats } from "../data/operations";

export function OperationsOverview() {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-foreground">
        Operations Overview
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {operationsStats.map((stat) => (
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
