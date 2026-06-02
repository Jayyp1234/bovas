import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/format";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  hint?: string;
}

export function StatCard({ icon: Icon, label, value, hint }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="inline-flex size-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Icon className="size-4" />
        </span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-foreground">
        {formatNumber(value)}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  );
}
