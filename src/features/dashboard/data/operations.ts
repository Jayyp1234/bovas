import { Ticket, Hourglass, CircleCheckBig, type LucideIcon } from "lucide-react";

export interface OperationsStat {
  label: string;
  value: number;
  hint?: string;
  icon: LucideIcon;
}

export const operationsStats: OperationsStat[] = [
  {
    label: "Generated Tickets",
    value: 134,
    hint: "Last generated 14:06",
    icon: Ticket,
  },
  { label: "Pending Tickets", value: 8, icon: Hourglass },
  { label: "Approved for Loading", value: 126, icon: CircleCheckBig },
];
