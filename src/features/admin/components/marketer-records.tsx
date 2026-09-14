"use client";

import { useState, useTransition, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { Dialog } from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination, ParamSelect, SearchInput } from "@/components/ui/table-controls";
import { useToast } from "@/components/ui/toaster";
import { TRUCK_TYPES, TRUCK_TYPE_LABEL } from "@/domain/labels";
import type { Customer, PaginationMeta, TruckType } from "@/lib/api/types";
import { saveCustomerAction } from "../customer-actions";

const COLUMNS = ["Name", "Type", "Representative", "Phone Number", "Email Address"];

const KIND_OPTIONS = [
  { value: "", label: "All types" },
  ...TRUCK_TYPES.map((kind) => ({ value: kind, label: TRUCK_TYPE_LABEL[kind] })),
];

const selectClass =
  "flex h-11 w-full rounded-xl border border-input bg-surface px-3.5 text-sm text-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";

interface FormValues {
  name: string;
  kind: TruckType;
  representative: string;
  phone: string;
  email: string;
}

const EMPTY: FormValues = { name: "", kind: "marketer", representative: "", phone: "", email: "" };

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

interface MarketerRecordsProps {
  customers: Customer[];
  meta: PaginationMeta;
}

export function MarketerRecords({ customers, meta }: MarketerRecordsProps) {
  const toast = useToast();
  const [editing, setEditing] = useState<Customer | "new" | null>(null);
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState<string>();
  const [pending, startTransition] = useTransition();

  const error = (key: string) => errors[key]?.[0];
  const set = (field: keyof FormValues) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setValues((current) => ({ ...current, [field]: event.target.value }));

  function open(customer: Customer | "new") {
    setEditing(customer);
    setValues(
      customer === "new"
        ? EMPTY
        : {
            name: customer.name,
            kind: customer.kind,
            representative: customer.representative ?? "",
            phone: customer.phone ?? "",
            email: customer.email ?? "",
          },
    );
    setErrors({});
    setMessage(undefined);
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;

    startTransition(async () => {
      const result = await saveCustomerAction(editing === "new" ? null : editing.id, {
        name: values.name,
        kind: values.kind,
        representative: values.representative || null,
        phone: values.phone || null,
        email: values.email || null,
      });

      if (result.ok) {
        toast(result.message);
        setEditing(null);
        return;
      }
      setErrors(result.fieldErrors);
      setMessage(result.message);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold tracking-tight text-foreground">Marketers&apos; Records</h1>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput placeholder="Search marketers" label="Search marketers" className="sm:w-80" />
          <div className="flex items-center gap-2">
            <ParamSelect param="kind" label="Filter by type" options={KIND_OPTIONS} />
            <Button size="sm" onClick={() => open("new")}>
              <Plus className="size-4" />
              Add Marketer
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <ResponsiveTable className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-y border-border bg-muted/40 text-left text-xs font-medium text-muted-foreground">
                {COLUMNS.map((column) => (
                  <th key={column} className="px-5 py-3 font-medium">
                    {column}
                  </th>
                ))}
                <th className="w-12 px-5 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b border-border transition-colors last:border-0 hover:bg-muted/50">
                  <td className="px-5 py-3.5 font-medium text-foreground">{customer.name}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{TRUCK_TYPE_LABEL[customer.kind]}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{customer.representative ?? "—"}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{customer.phone ?? "—"}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{customer.email ?? "—"}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => open(customer)}
                      aria-label={`Edit ${customer.name}`}
                      className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
                    >
                      <Pencil className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={COLUMNS.length + 1} className="px-5 py-12 text-center text-sm text-muted-foreground">
                    No records match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </ResponsiveTable>
        </div>

        <Pagination page={meta.page} perPage={meta.per_page} total={meta.total} noun="records" />
      </Card>

      <Dialog
        open={editing !== null}
        onClose={() => !pending && setEditing(null)}
        title={editing === "new" ? "Add Marketer" : "Edit Marketer"}
        className="max-w-lg"
      >
        <form onSubmit={save} noValidate className="space-y-4">
          {message && (
            <p role="alert" className="rounded-xl bg-danger-surface px-3 py-2.5 text-sm font-medium text-danger">
              {message}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="customer-name" label="Name" error={error("name")}>
              <Input id="customer-name" value={values.name} onChange={set("name")} className="h-11 rounded-xl" />
            </Field>
            <Field id="customer-kind" label="Type" error={error("kind")}>
              <select id="customer-kind" value={values.kind} onChange={set("kind")} className={selectClass}>
                {TRUCK_TYPES.map((kind) => (
                  <option key={kind} value={kind}>
                    {TRUCK_TYPE_LABEL[kind]}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field id="customer-representative" label="Representative" error={error("representative")}>
            <Input id="customer-representative" value={values.representative} onChange={set("representative")} className="h-11 rounded-xl" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="customer-phone" label="Phone Number" error={error("phone")}>
              <Input id="customer-phone" type="tel" value={values.phone} onChange={set("phone")} className="h-11 rounded-xl" />
            </Field>
            <Field id="customer-email" label="Email Address" error={error("email")}>
              <Input id="customer-email" type="email" value={values.email} onChange={set("email")} className="h-11 rounded-xl" />
            </Field>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setEditing(null)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : editing === "new" ? "Add Marketer" : "Save Changes"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
