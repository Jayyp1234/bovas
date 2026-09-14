import "server-only";
import { apiRequest, fromApi, isLive } from "./client";
import * as mock from "./mock/customers";
import type { Customer, CustomerInput, CustomerPage, CustomerPatch, CustomerQuery } from "./types";

/** Customers and marketers, for Marketers' Records and the ticket form. `GET /api/customers` (phase 3) */
export function listCustomers(query: CustomerQuery = {}): Promise<CustomerPage> {
  return fromApi<CustomerPage>(
    3,
    () => apiRequest("/api/customers", { query }),
    () => mock.listCustomers(query),
  );
}

/** Adds a customer or marketer. `POST /api/customers` (phase 5) — 422 when the name is taken. */
export function createCustomer(input: CustomerInput): Promise<Customer> {
  return isLive(5)
    ? apiRequest("/api/customers", { method: "POST", body: input })
    : mock.createCustomer(input);
}

/** `PATCH /api/customers/{id}` (phase 5) */
export function updateCustomer(id: number, patch: CustomerPatch): Promise<Customer> {
  return isLive(5)
    ? apiRequest(`/api/customers/${id}`, { method: "PATCH", body: patch })
    : mock.updateCustomer(id, patch);
}
