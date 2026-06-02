export type SafetyStatus = "approved" | "rejected";
export type TruckType = "Internal" | "Marketer" | "Industrial";

/** A ticket awaiting safety inspection in the queue. */
export interface QueueTicket {
  id: string;
  truckNumber: string;
  truckType: TruckType;
  product: string;
  quantity: string;
  driver: string;
  waitMins: number;
}

export const queueTickets: QueueTicket[] = Array.from({ length: 7 }, (_, i) => ({
  id: `2104070${i + 1}`,
  truckNumber: "BDJ580XB",
  truckType: "Internal",
  product: "PMS",
  quantity: "45,000 Litres",
  driver: "Ayilara Oluwatobiloba",
  waitMins: 12,
}));

/** A safety checklist section with its inspectable items. */
export interface ChecklistSection {
  no: number;
  title: string;
  items: string[];
}

export const checklistSections: ChecklistSection[] = [
  {
    no: 1,
    title: "PPE & Personnel Compliance",
    items: ["Head Hat", "Safety Boots", "Reflective Gadgets"],
  },
  {
    no: 2,
    title: "Fire & Static Prevention",
    items: ["Fire Extinguisher", "Spark Arrestor"],
  },
  {
    no: 3,
    title: "Mechanical Integrity",
    items: ["Brake System", "Spare Tyre"],
  },
  {
    no: 4,
    title: "Signage & Environmental Safety",
    items: [
      "Warning Caution Triangles",
      "Highly Inflammable Sign",
      "Reflective bar sign",
    ],
  },
];

export const rejectionReasons = [
  "PPE",
  "Fire Safety",
  "Mechanical",
  "Signage",
  "Other",
];

/** An inspected ticket shown in the history log and its detail view. */
export interface SafetyRecord {
  id: string;
  customer: string;
  truckNumber: string;
  driver: string;
  status: SafetyStatus;
  date: string;
  terminal: string;
  truckType: TruckType;
  driverName: string;
  driverPhone: string;
  reason?: string;
}

function record(
  id: string,
  customer: string,
  status: SafetyStatus,
  truckType: TruckType,
  reason?: string,
): SafetyRecord {
  return {
    id,
    customer,
    truckNumber: "BDJ590XA",
    driver: "Babatunde Ishola",
    status,
    date: "25th August, 2026",
    terminal: "Terminal 1",
    truckType,
    driverName: "Opeyemi Fadenipo",
    driverPhone: "08104205202",
    reason,
  };
}

export const safetyRecords: SafetyRecord[] = [
  record("24989001", "BOVAS", "approved", "Internal"),
  record("24989002", "Fatgbems", "rejected", "Marketer", "No PPE"),
  record("24989003", "Connoil", "rejected", "Industrial", "No Fire Extinguisher"),
  record("24989004", "BOVAS", "approved", "Internal"),
  record("24989005", "MRS", "rejected", "Industrial", "Faulty Brake System"),
  record("24989006", "BOVAS", "approved", "Internal"),
  record("24989007", "Hill Crest", "approved", "Marketer"),
  record("24989008", "Feasible Path", "approved", "Marketer"),
  record("24989009", "Jots M", "approved", "Marketer"),
  record("24989010", "Fatgbems", "rejected", "Industrial", "No PPE"),
];

export function getSafetyRecordById(id: string): SafetyRecord | undefined {
  return safetyRecords.find((item) => item.id === id);
}
