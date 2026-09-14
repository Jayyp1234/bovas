import type {
  CustomerRef,
  Driver,
  PaginationMeta,
  StaffRef,
  TerminalRef,
  TruckRef,
  TruckType,
} from "../types";

/*
 * Reference records shared by the mock fixtures, so a customer or officer has the same
 * ID and name on every screen. Aggregate endpoints (stats, charts, report totals) return
 * canned day totals; list fixtures hold one sample page of rows.
 */

/** The sample operating day, 25 August 2026. `at("07:12")` is 08:12 in Lagos. */
export const SAMPLE_DATE = "2026-08-25";

export function at(utcTime: string): string {
  return `${SAMPLE_DATE}T${utcTime}:00Z`;
}

export const TERMINALS = {
  one: { id: 1, name: "Terminal 1" },
  two: { id: 2, name: "Terminal 2" },
} satisfies Record<string, TerminalRef>;

export const CUSTOMERS = {
  bovas: { id: 1, name: "BOVAS", kind: "internal" },
  fatgbems: { id: 2, name: "Fatgbems", kind: "industrial" },
  connoil: { id: 3, name: "Connoil", kind: "industrial" },
  mrs: { id: 4, name: "MRS", kind: "industrial" },
  hillCrest: { id: 5, name: "Hill Crest", kind: "marketer" },
  feasiblePath: { id: 6, name: "Feasible Path", kind: "marketer" },
  jotsM: { id: 7, name: "Jots M", kind: "marketer" },
  babatunde: { id: 8, name: "Babatunde", kind: "marketer" },
} satisfies Record<string, CustomerRef>;

export const STAFF = {
  depotManager: { staff_no: "BO001", name: "Olayinka Fagboore" },
  safetyOfficer: { staff_no: "BO003", name: "Abdullah Aiyedun" },
  logisticsOfficer: { staff_no: "BO006", name: "Chidinma Eboh" },
} satisfies Record<string, StaffRef>;

export const DRIVERS = {
  ayilara: { name: "Ayilara Oluwatobiloba", phone: "08104205202" },
  opeyemi: { name: "Opeyemi Fadenipo", phone: "08104205202" },
} satisfies Record<string, Driver>;

export function truck(plate: string, type: TruckType): TruckRef {
  return { plate, type };
}

export function customerById(id: number): CustomerRef | undefined {
  return Object.values(CUSTOMERS).find((customer) => customer.id === id);
}

export function terminalById(id: number): TerminalRef | undefined {
  return Object.values(TERMINALS).find((terminal) => terminal.id === id);
}

/** The current time the way the API writes timestamps: "2026-09-14T08:12:00Z". */
export function nowTimestamp(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

/** "Now" for sample-day records, so their wait times look like a morning at the depot. */
const SAMPLE_NOW = Date.parse(at("08:40"));

/** Whole minutes since a timestamp. Sample-day timestamps count from 08:40 that morning. */
export function minutesWaiting(since: string): number {
  const now = since.startsWith(SAMPLE_DATE) ? SAMPLE_NOW : Date.now();
  return Math.max(0, Math.round((now - Date.parse(since)) / 60_000));
}

/** The API's message for a 422. */
export const VALIDATION_MESSAGE = "Check the highlighted fields and try again.";

/** Slices a fixture list the way the API paginates (default 20, at most 100 per page). */
export function paginate<T>(
  items: T[],
  page = 1,
  perPage = 20,
): { data: T[]; meta: PaginationMeta } {
  const size = Math.min(Math.max(perPage, 1), 100);
  const current = Math.max(page, 1);
  return {
    data: items.slice((current - 1) * size, current * size),
    meta: { page: current, per_page: size, total: items.length },
  };
}

/** Case-insensitive match of the `q` parameter against any of the given text fields. */
export function matchesSearch(
  q: string | undefined,
  ...fields: (string | null | undefined)[]
): boolean {
  const needle = q?.trim().toLowerCase();
  return !needle || fields.some((field) => field?.toLowerCase().includes(needle));
}
