export type AuditStatus = "completed" | "pending" | "failed";
export type LoadingOutcome = "within-limit" | "overloaded";
export type TruckType = "Internal" | "Marketer" | "Industrial";

export interface TimelineEntry {
  label: string;
  time: string;
}

export interface StaffMember {
  role: string;
  name: string;
}

export interface AuditRecord {
  id: string;
  // Table columns
  customer: string;
  truckType: TruckType;
  truckNumber: string;
  product: string;
  quantity: string;
  destination: string;
  // Detail header
  date: string;
  terminal: string;
  status: AuditStatus;
  // Truck information
  capacity: string;
  loadingTicketId: string;
  // Loading summary (completed only)
  outcome?: LoadingOutcome;
  requestedQuantity?: string;
  actualLoaded?: string;
  variance?: string;
  waybillId?: string;
  // Process detail
  timeline: TimelineEntry[];
  staff: StaffMember[];
  overloadingApprovedBy?: string;
  reason?: string;
}

const STAFF_FULL: StaffMember[] = [
  { role: "Logistics", name: "Olateju Osunkeye" },
  { role: "Safety", name: "Modupe Johnson" },
  { role: "Loader", name: "Ayomide Olamide" },
  { role: "Dispatch", name: "Chidinma Eboh" },
];

const STAFF_PARTIAL: StaffMember[] = [
  { role: "Logistics", name: "Olateju Osunkeye" },
  { role: "Safety", name: "Modupe Johnson" },
];

const TIMELINE_WITHIN_LIMIT: TimelineEntry[] = [
  { label: "Loading Ticket Created", time: "08:12" },
  { label: "Safety", time: "08:40" },
  { label: "Waybill Ticket Created", time: "09:30" },
  { label: "Gate Cleared", time: "09:35" },
];

const TIMELINE_OVERLOADED: TimelineEntry[] = [
  { label: "Loading Ticket Created", time: "08:12" },
  { label: "Safety", time: "08:40" },
  { label: "Loading Ticket Edited", time: "09:00" },
  { label: "Waybill Ticket Created", time: "09:30" },
  { label: "Gate Cleared", time: "09:35" },
];

const TIMELINE_PARTIAL: TimelineEntry[] = [
  { label: "Loading Ticket Created", time: "08:12" },
  { label: "Safety", time: "08:40" },
];

const STATION = "Babatunde Ishola Filling Station, Lagos";

/** Shared defaults for the depot/date fields. */
const base = {
  date: "25th August, 2026",
  terminal: "Terminal 1",
  capacity: "45,000 Litres",
  loadingTicketId: "24989001",
};

const completedWithinLimit = {
  ...base,
  status: "completed" as const,
  outcome: "within-limit" as const,
  requestedQuantity: "45,000 Litres",
  actualLoaded: "45,000 Litres",
  variance: "0 Litres",
  waybillId: "A1234567",
  timeline: TIMELINE_WITHIN_LIMIT,
  staff: STAFF_FULL,
};

export const auditRecords: AuditRecord[] = [
  {
    id: "1",
    customer: "BOVAS",
    truckType: "Internal",
    truckNumber: "BDJ580XB",
    product: "PMS",
    quantity: "45,000 Litres",
    destination: "Akobo 1 (30,000L) / Akobo 2 (15,000L)",
    ...completedWithinLimit,
  },
  {
    id: "2",
    customer: "Fatgbems",
    truckType: "Industrial",
    truckNumber: "BDJ590XA",
    product: "PMS",
    quantity: "33,000 Litres",
    destination: STATION,
    ...base,
    status: "failed",
    timeline: TIMELINE_PARTIAL,
    staff: STAFF_PARTIAL,
    reason: "Driver not compliant with detination",
  },
  {
    id: "3",
    customer: "Connoil",
    truckType: "Industrial",
    truckNumber: "BDJ590XA",
    product: "PMS",
    quantity: "60,000 Litres",
    destination: STATION,
    ...base,
    status: "pending",
    timeline: TIMELINE_PARTIAL,
    staff: STAFF_PARTIAL,
    reason: "Awaiting approval from admin due to overloading",
  },
  {
    id: "4",
    customer: "BOVAS",
    truckType: "Internal",
    truckNumber: "BDJ580XB",
    product: "PMS",
    quantity: "45,000 Litres",
    destination: "Local",
    ...base,
    status: "completed",
    outcome: "overloaded",
    requestedQuantity: "45,000 Litres",
    actualLoaded: "45,000 Litres",
    variance: "0 Litres",
    waybillId: "A1234567",
    timeline: TIMELINE_OVERLOADED,
    staff: STAFF_FULL,
    overloadingApprovedBy: "Olayinka Fagboore",
  },
  {
    id: "5",
    customer: "MRS",
    truckType: "Industrial",
    truckNumber: "T12345-LA",
    product: "PMS",
    quantity: "60,000 Litres",
    destination: STATION,
    ...completedWithinLimit,
  },
  {
    id: "6",
    customer: "Babatunde",
    truckType: "Marketer",
    truckNumber: "BDJ590XA",
    product: "PMS",
    quantity: "33,000 Litres",
    destination: STATION,
    ...completedWithinLimit,
  },
  {
    id: "7",
    customer: "Hill Crest",
    truckType: "Marketer",
    truckNumber: "BDJ590XA",
    product: "PMS",
    quantity: "45,000 Litres",
    destination: STATION,
    ...completedWithinLimit,
  },
  {
    id: "8",
    customer: "Feasible Path",
    truckType: "Marketer",
    truckNumber: "BDJ590XA",
    product: "PMS",
    quantity: "50,000 Litres",
    destination: STATION,
    ...completedWithinLimit,
  },
  {
    id: "9",
    customer: "Jots M",
    truckType: "Marketer",
    truckNumber: "BDJ590XA",
    product: "PMS",
    quantity: "45,000 Litres",
    destination: STATION,
    ...completedWithinLimit,
  },
  {
    id: "10",
    customer: "Fatgbems",
    truckType: "Industrial",
    truckNumber: "BDJ590XA",
    product: "PMS",
    quantity: "45,000 Litres",
    destination: STATION,
    ...base,
    status: "failed",
    timeline: TIMELINE_PARTIAL,
    staff: STAFF_PARTIAL,
    reason: "Driver not compliant with detination",
  },
];

export function getAuditRecordById(id: string): AuditRecord | undefined {
  return auditRecords.find((record) => record.id === id);
}
