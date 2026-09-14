"use server";

import { revalidatePath } from "next/cache";
import { actionFailure, type ActionResult } from "@/lib/action-result";
import { createCustomer, updateCustomer } from "@/lib/api/customers";
import type { CustomerInput } from "@/lib/api/types";

/** Adds a customer, or saves changes to the one with `id`. */
export async function saveCustomerAction(id: number | null, input: CustomerInput): Promise<ActionResult> {
  try {
    const customer = id === null ? await createCustomer(input) : await updateCustomer(id, input);
    revalidatePath("/admin/marketer-records");
    return { ok: true, message: id === null ? `${customer.name} added.` : `${customer.name} saved.` };
  } catch (error) {
    return actionFailure(error, "We couldn't save the record. Try again.");
  }
}
