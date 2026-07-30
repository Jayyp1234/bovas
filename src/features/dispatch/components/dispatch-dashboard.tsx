"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/features/dashboard/components/stat-card";
import { MarketerChart } from "@/features/dashboard/components/marketer-chart";
import { formatLongDate } from "@/lib/format";
import {
  dispatchStats,
  trucksPerMarketer,
  quantityLoadedPerMarketer,
} from "../data/waybills";
import { TodaysWaybillsTable } from "./todays-waybills-table";

export function DispatchDashboard() {
  const router = useRouter();

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Welcome, Chidinma!
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatLongDate(new Date())}
          </p>
        </div>
        <Button
          className="self-start sm:self-auto"
          onClick={() => router.push("/dispatch/queue")}
        >
          View Dispatch Queue
        </Button>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Operations Overview
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dispatchStats.map((stat) => (
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
          title="Quantity Loaded per Marketer"
          data={quantityLoadedPerMarketer}
        />
      </div>

      <TodaysWaybillsTable />
    </div>
  );
}
