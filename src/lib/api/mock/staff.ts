import { ApiError } from "../client";
import type {
  NextStaffNo,
  Role,
  StaffInput,
  StaffPage,
  StaffPatch,
  StaffQuery,
  TerminalRef,
  User,
} from "../types";
import { TERMINALS, VALIDATION_MESSAGE, matchesSearch, paginate, terminalById } from "./shared";

/** App access by department. Tank Farm and Lab & QA staff don't sign in. */
const ROLE_BY_DEPARTMENT: Record<string, Role | null> = {
  Admin: "admin",
  Logistics: "logistics",
  Safety: "safety",
  Dispatch: "dispatch",
  Loading: "dispatch",
};

function member(
  staffNo: string,
  name: string,
  terminal: TerminalRef,
  department: string,
  roleTitle: string,
  active = true,
): User {
  return {
    staff_no: staffNo,
    name,
    email: `${name.toLowerCase().replace(/\s+/g, "")}@bovasgroups.com`,
    phone: "08104205202",
    terminal,
    department,
    role: ROLE_BY_DEPARTMENT[department] ?? null,
    role_title: roleTitle,
    active,
    avatar_url: null,
  };
}

/** Matches bovas-api's seeded staff. */
const staff: User[] = [
  member("BO001", "Olayinka Fagboore", TERMINALS.one, "Admin", "Depot Manager"),
  member("BO002", "Doris Shitta", TERMINALS.two, "Admin", "Deputy Depot Manager"),
  member("BO003", "Abdullah Aiyedun", TERMINALS.one, "Safety", "Supervisor"),
  member("BO004", "Olateju Olasunkanmi", TERMINALS.two, "Dispatch", "Staff", false),
  member("BO005", "Ayomide Ayoola", TERMINALS.one, "Loading", "Staff"),
  member("BO006", "Chidinma Eboh", TERMINALS.one, "Logistics", "Staff"),
  member("BO007", "Demilade Ajayi", TERMINALS.two, "Tank Farm", "Staff"),
  member("BO008", "Stella Okafor", TERMINALS.one, "Lab & QA", "Supervisor"),
  member("BO009", "Modupe Tambuwal", TERMINALS.two, "Safety", "Staff", false),
  member("BO010", "Modupe Johnson", TERMINALS.one, "Dispatch", "Staff"),
  member("BO011", "Tunde Bakare", TERMINALS.two, "Loading", "Staff"),
  member("BO012", "Ngozi Okonkwo", TERMINALS.one, "Logistics", "Staff"),
  member("BO013", "Ifeoluwa Adeyemi", TERMINALS.two, "Safety", "Staff"),
  member("BO014", "Olateju Oyetoke", TERMINALS.one, "Logistics", "Logistics Officer"),
];

export function findStaffByEmail(email: string): User | undefined {
  const needle = email.trim().toLowerCase();
  return staff.find((person) => person.email === needle);
}

export function findStaffByNo(staffNo: string): User | undefined {
  return staff.find((person) => person.staff_no === staffNo);
}

export async function listStaff(query: StaffQuery = {}): Promise<StaffPage> {
  const matches = staff
    .filter((person) => !query.department || person.department === query.department)
    .filter((person) => query.active === undefined || person.active === query.active)
    .filter((person) =>
      matchesSearch(query.q, person.staff_no, person.name, person.terminal.name, person.department),
    );

  return paginate(matches, query.page, query.per_page);
}

export async function getStaff(staffNo: string): Promise<User | null> {
  return findStaffByNo(staffNo) ?? null;
}

export async function getNextStaffNo(): Promise<NextStaffNo> {
  const highest = Math.max(0, ...staff.map((person) => Number(person.staff_no.slice(2))));
  return { staff_no: `BO${String(highest + 1).padStart(3, "0")}` };
}

function findOrFail(staffNo: string): User {
  const person = findStaffByNo(staffNo.toUpperCase());
  if (!person) throw new ApiError(404, `Staff member ${staffNo} was not found.`);
  return person;
}

function checkEmail(email: string, except?: User): void {
  const taken = staff.some((person) => person !== except && person.email === email.trim().toLowerCase());
  if (taken) {
    throw new ApiError(422, VALIDATION_MESSAGE, { email: ["Another staff member already uses this email."] });
  }
}

/** Demo mode has no email, so the temporary password isn't sent anywhere. */
export async function createStaff(input: StaffInput): Promise<User> {
  const required = ["name", "email", "phone", "department", "role_title", "temporary_password"] as const;
  const missing = required.filter((field) => !String(input[field] ?? "").trim());
  if (missing.length > 0 || !terminalById(input.terminal_id)) {
    const errors = Object.fromEntries(missing.map((field) => [field, ["This field is required."]]));
    if (!terminalById(input.terminal_id)) errors.terminal_id = ["Choose a terminal that exists."];
    throw new ApiError(422, VALIDATION_MESSAGE, errors);
  }
  checkEmail(input.email);

  const person: User = {
    staff_no: (await getNextStaffNo()).staff_no,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    terminal: terminalById(input.terminal_id) ?? TERMINALS.one,
    department: input.department.trim(),
    role: input.role ?? null,
    role_title: input.role_title.trim(),
    active: true,
    avatar_url: null,
  };
  staff.push(person);
  return person;
}

export async function updateStaff(staffNo: string, patch: StaffPatch): Promise<User> {
  const person = findOrFail(staffNo);
  if (patch.email !== undefined) checkEmail(patch.email, person);
  if (patch.terminal_id !== undefined && !terminalById(patch.terminal_id)) {
    throw new ApiError(422, VALIDATION_MESSAGE, { terminal_id: ["Choose a terminal that exists."] });
  }

  Object.assign(person, {
    ...(patch.name !== undefined && { name: patch.name.trim() }),
    ...(patch.email !== undefined && { email: patch.email.trim().toLowerCase() }),
    ...(patch.phone !== undefined && { phone: patch.phone.trim() }),
    ...(patch.terminal_id !== undefined && { terminal: terminalById(patch.terminal_id) }),
    ...(patch.department !== undefined && { department: patch.department.trim() }),
    ...(patch.role !== undefined && { role: patch.role }),
    ...(patch.role_title !== undefined && { role_title: patch.role_title.trim() }),
  });
  return person;
}

export async function setStaffActive(staffNo: string, active: boolean): Promise<User> {
  const person = findOrFail(staffNo);
  person.active = active;
  return person;
}

/** Mirrors the API: the demo accounts have ticket history, so they can only be deactivated. */
export async function deleteStaff(staffNo: string): Promise<void> {
  const person = findOrFail(staffNo);
  if (["BO001", "BO003", "BO006", "BO010", "BO014"].includes(person.staff_no)) {
    throw new ApiError(
      409,
      `${person.name} appears in ticket history, so the profile can't be deleted. Deactivate the account instead.`,
    );
  }
  staff.splice(staff.indexOf(person), 1);
}

export async function uploadStaffAvatar(): Promise<User> {
  throw new ApiError(422, VALIDATION_MESSAGE, {
    file: ["Profile pictures are saved when the app is connected to bovas-api."],
  });
}

export async function deleteStaffAvatar(staffNo: string): Promise<User> {
  return findOrFail(staffNo);
}
