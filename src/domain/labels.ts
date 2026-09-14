/**
 * How API enum values read in the UI. The values themselves are defined by the contract
 * (bovas-api/openapi.yaml); only their wording lives here. Safe for client components.
 */
import type {
  AuditStatus,
  RejectionReason,
  TicketStatus,
  TicketStatusGroup,
  TruckType,
} from "@/lib/api/types";

export const TRUCK_TYPES: TruckType[] = ["internal", "marketer", "industrial"];

export const TRUCK_TYPE_LABEL: Record<TruckType, string> = {
  internal: "Internal",
  marketer: "Marketer",
  industrial: "Industrial",
};

export type TruckTypeFilter = "all" | TruckType;

/** The All / Internal / Marketer / Industrial tabs above the lists. */
export const TRUCK_TYPE_FILTERS: { key: TruckTypeFilter; label: string }[] = [
  { key: "all", label: "All" },
  ...TRUCK_TYPES.map((type) => ({ key: type, label: TRUCK_TYPE_LABEL[type] })),
];

export const REJECTION_REASON_LABEL: Record<RejectionReason, string> = {
  ppe: "PPE",
  fire_safety: "Fire Safety",
  mechanical: "Mechanical",
  signage: "Signage",
  other: "Other",
};

export const TICKET_STATUS_LABEL: Record<TicketStatus, string> = {
  awaiting_safety: "Awaiting Safety",
  approved_for_loading: "Approved for Loading",
  rejected: "Rejected",
  overload_pending: "Overload Pending",
  overload_denied: "Overload Denied",
  loaded: "Loaded",
  waybill_issued: "Waybill Issued",
  gate_cleared: "Gate Cleared",
};

/** The Sort menu on Ticket History; values are the API's `sort` parameter. */
export const TICKET_SORTS = ["-created_at", "created_at", "customer", "-requested_litres"] as const;

export const TICKET_SORT_OPTIONS: { value: (typeof TICKET_SORTS)[number]; label: string }[] = [
  { value: "-created_at", label: "Newest first" },
  { value: "created_at", label: "Oldest first" },
  { value: "customer", label: "Customer A–Z" },
  { value: "-requested_litres", label: "Largest quantity" },
];

export const AUDIT_STATUS_LABEL: Record<AuditStatus, string> = {
  completed: "Completed",
  pending: "Pending",
  failed: "Failed",
};

export const STATUS_GROUP_LABEL: Record<TicketStatusGroup, string> = {
  approved: "Approved",
  pending: "Pending",
  rejected: "Rejected",
};

/** Which list tab a ticket belongs to. Mirrors TicketStatus::group() in bovas-api. */
export function ticketStatusGroup(status: TicketStatus): TicketStatusGroup {
  switch (status) {
    case "awaiting_safety":
    case "overload_pending":
      return "pending";
    case "rejected":
    case "overload_denied":
      return "rejected";
    default:
      return "approved";
  }
}

const ROLE_TITLE_ABBREVIATIONS: Record<string, string> = {
  "Depot Manager": "DM",
  "Deputy Depot Manager": "DDM",
};

/** "Deputy Depot Manager" → "DDM" for the staff table; shorter titles stay as they are. */
export function shortRoleTitle(title: string): string {
  return ROLE_TITLE_ABBREVIATIONS[title] ?? title;
}
