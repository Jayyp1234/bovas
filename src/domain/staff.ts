/** Options for staff profiles. Safe for client components. */
import { ROLE_LABEL } from "@/domain/roles";
import type { Role } from "@/lib/api/types";

/** Departments at the depot. Tank Farm and Lab & QA staff usually have no app access. */
export const DEPARTMENTS = ["Admin", "Safety", "Dispatch", "Loading", "Logistics", "Tank Farm", "Lab & QA"];

/** Job titles shown on profiles; separate from app access. */
export const ROLE_TITLES = ["Depot Manager", "Deputy Depot Manager", "Supervisor", "Logistics Officer", "Staff"];

/** Which workspace a staff member signs in to, or none. */
export const ACCESS_OPTIONS: { value: Role | ""; label: string }[] = [
  { value: "", label: "No app access" },
  ...(Object.keys(ROLE_LABEL) as Role[]).map((role) => ({ value: role, label: ROLE_LABEL[role] })),
];
