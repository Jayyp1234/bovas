export interface StaffRecord {
  id: string;
  name: string;
  terminal: string;
  department: string;
  /** Short role shown in the table (e.g. "DM", "Staff"). */
  role: string;
  /** Full role title shown on the detail page. */
  roleTitle: string;
  email: string;
  phone: string;
  active: boolean;
}

function staff(
  id: string,
  name: string,
  terminal: string,
  department: string,
  role: string,
  roleTitle: string,
  active = true,
): StaffRecord {
  return {
    id,
    name,
    terminal,
    department,
    role,
    roleTitle,
    email: `${name.toLowerCase().replace(/\s+/g, "")}@bovasgroups.com`,
    phone: "08104205202",
    active,
  };
}

export const staffRecords: StaffRecord[] = [
  staff("BO001", "Olayinka Fagboore", "Terminal 1", "Admin", "DM", "Deputy Depot Manager"),
  staff("BO002", "Doris Shitta", "Terminal 2", "Admin", "DDM", "Deputy Depot Manager"),
  staff("BO003", "Abdullah Aiyedun", "Terminal 1", "Safety", "Supervisor", "Supervisor"),
  staff("BO004", "Olateju Olasunkanmi", "Terminal 2", "Dispatch", "Staff", "Staff", false),
  staff("BO005", "Ayomide Ayoola", "Terminal 1", "Loading", "Staff", "Staff"),
  staff("BO006", "Chidinma Eboh", "Terminal 1", "Logistics", "Staff", "Staff"),
  staff("BO007", "Demilade Ajayi", "Terminal 2", "Tank Farm", "Staff", "Staff"),
  staff("BO008", "Stella Okafor", "Terminal 1", "Lab & QA", "Supervisor", "Supervisor"),
  staff("BO009", "Modupe Tambuwal", "Terminal 2", "Safety", "Staff", "Staff", false),
  staff("BO010", "Modupe Johnson", "Terminal 1", "Dispatch", "Staff", "Staff"),
  staff("BO011", "Modupe Johnson", "Terminal 1", "Dispatch", "Staff", "Staff"),
  staff("BO012", "Modupe Johnson", "Terminal 1", "Dispatch", "Staff", "Staff"),
  staff("BO013", "Modupe Johnson", "Terminal 1", "Dispatch", "Staff", "Staff"),
];

export function getStaffById(id: string): StaffRecord | undefined {
  return staffRecords.find((record) => record.id === id);
}
