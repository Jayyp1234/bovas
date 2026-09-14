import { Badge } from "@/components/ui/badge";
import { STATUS_GROUP_LABEL, ticketStatusGroup } from "@/domain/labels";
import type { TicketStatus, TicketStatusGroup } from "@/lib/api/types";

const VARIANT: Record<TicketStatusGroup, "success" | "warning" | "danger"> = {
  approved: "success",
  pending: "warning",
  rejected: "danger",
};

/** Collapses the workflow status into the Approved / Pending / Rejected badge. */
export function StatusBadge({ status }: { status: TicketStatus }) {
  const group = ticketStatusGroup(status);
  return (
    <Badge variant={VARIANT[group]} withDot>
      {STATUS_GROUP_LABEL[group]}
    </Badge>
  );
}
