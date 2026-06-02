import { Badge } from "@/components/ui/badge";
import type { TicketStatus } from "../types";

const STATUS_CONFIG: Record<
  TicketStatus,
  { label: string; variant: "success" | "warning" | "danger" }
> = {
  approved: { label: "Approved", variant: "success" },
  pending: { label: "Pending", variant: "warning" },
  rejected: { label: "Rejected", variant: "danger" },
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  const { label, variant } = STATUS_CONFIG[status];
  return (
    <Badge variant={variant} withDot>
      {label}
    </Badge>
  );
}
