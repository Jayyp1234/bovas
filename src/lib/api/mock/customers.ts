import { ApiError } from "../client";
import type { Customer, CustomerInput, CustomerPage, CustomerPatch, CustomerQuery } from "../types";
import { CUSTOMERS, VALIDATION_MESSAGE, matchesSearch, paginate } from "./shared";

const customers: Customer[] = [
  { ...CUSTOMERS.bovas, representative: null, phone: null, email: null },
  { ...CUSTOMERS.fatgbems, representative: "Adebayo Fatoki", phone: "08104205210", email: "adebayofatoki@gmail.com" },
  { ...CUSTOMERS.connoil, representative: "Chukwudi Eze", phone: "08104205211", email: "chukwudieze@gmail.com" },
  { ...CUSTOMERS.mrs, representative: "Hauwa Bello", phone: "08104205212", email: "hauwabello@gmail.com" },
  { ...CUSTOMERS.hillCrest, representative: "Elizabeth Fadenipo", phone: "08104205202", email: "elizabethfadenipo@gmail.com" },
  { ...CUSTOMERS.feasiblePath, representative: "Opeyemi Fadenipo", phone: "08104205203", email: "opeyemifadenipo@gmail.com" },
  { ...CUSTOMERS.jotsM, representative: "Tobi Jotham", phone: "08104205213", email: "tobijotham@gmail.com" },
  { ...CUSTOMERS.babatunde, representative: "Babatunde Ishola", phone: "08104205214", email: "babatundeishola@gmail.com" },
];

/** By name, as the API sorts them. */
export async function listCustomers(query: CustomerQuery = {}): Promise<CustomerPage> {
  const matches = [...customers]
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter((customer) => !query.kind || customer.kind === query.kind)
    .filter((customer) =>
      matchesSearch(query.q, customer.name, customer.representative, customer.email),
    );

  return paginate(matches, query.page, query.per_page);
}

function blankToNull(value: string | null | undefined): string | null {
  return value?.trim() ? value.trim() : null;
}

function checkName(name: string, except?: Customer): void {
  const taken = customers.some(
    (customer) => customer !== except && customer.name.toLowerCase() === name.trim().toLowerCase(),
  );
  if (taken) {
    throw new ApiError(422, VALIDATION_MESSAGE, { name: ["A customer with this name already exists."] });
  }
}

export async function createCustomer(input: CustomerInput): Promise<Customer> {
  if (!input.name?.trim()) {
    throw new ApiError(422, VALIDATION_MESSAGE, { name: ["Name is required."] });
  }
  checkName(input.name);

  const customer: Customer = {
    id: Math.max(...customers.map((current) => current.id)) + 1,
    name: input.name.trim(),
    kind: input.kind,
    representative: blankToNull(input.representative),
    phone: blankToNull(input.phone),
    email: blankToNull(input.email),
  };
  customers.push(customer);
  return customer;
}

export async function updateCustomer(id: number, patch: CustomerPatch): Promise<Customer> {
  const customer = customers.find((current) => current.id === id);
  if (!customer) {
    throw new ApiError(404, `Customer ${id} was not found.`);
  }
  if (patch.name !== undefined) checkName(patch.name, customer);

  Object.assign(customer, {
    ...(patch.name !== undefined && { name: patch.name.trim() }),
    ...(patch.kind !== undefined && { kind: patch.kind }),
    ...(patch.representative !== undefined && { representative: blankToNull(patch.representative) }),
    ...(patch.phone !== undefined && { phone: blankToNull(patch.phone) }),
    ...(patch.email !== undefined && { email: blankToNull(patch.email) }),
  });
  return customer;
}
