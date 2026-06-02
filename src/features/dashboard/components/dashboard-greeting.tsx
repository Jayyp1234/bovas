"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatLongDate } from "@/lib/format";

interface DashboardGreetingProps {
  name: string;
  date: Date;
}

export function DashboardGreeting({ name, date }: DashboardGreetingProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Welcome, {name}!
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatLongDate(date)}
        </p>
      </div>
      <Button
        className="self-start sm:self-auto"
        onClick={() => router.push("/generate-ticket")}
      >
        Generate Ticket
      </Button>
    </div>
  );
}
