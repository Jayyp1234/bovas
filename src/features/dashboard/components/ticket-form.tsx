"use client";

import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import { TRUCK_TYPES, TRUCK_TYPE_LABEL } from "@/domain/labels";
import type { Customer, Product, Terminal, TruckType } from "@/lib/api/types";
import { saveTicket } from "../actions";
import {
  PRODUCTS,
  PRODUCT_LABEL,
  allocatedLitres,
  checkValues,
  draftPreview,
  toLitres,
  toTicketInput,
  type DestinationValues,
  type TicketFormValues,
} from "../ticket-values";
import { TicketPreviewPanel } from "./ticket-preview-panel";

const selectClass =
  "flex h-14 w-full rounded-xl border border-input bg-surface px-3.5 text-sm text-foreground transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:bg-muted/50 disabled:text-muted-foreground aria-invalid:border-danger";

const inputClass = "h-14 rounded-xl aria-invalid:border-danger";

function Field({
  id,
  label,
  error,
  hint,
  className,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

interface TicketFormProps {
  /** Set when editing a ticket Safety hasn't inspected yet. */
  ticketNo?: string;
  /** The loading program row this ticket starts from. */
  programItemId?: number;
  initial: TicketFormValues;
  terminals: Terminal[];
  customers: Customer[];
  /** Signs the ticket. */
  officer: { name: string; title: string };
  /** When the form opened, in depot time. The API stamps the real time when it saves. */
  issuedAt: { date: string; time: string };
}

export function TicketForm({
  ticketNo,
  programItemId,
  initial,
  terminals,
  customers,
  officer,
  issuedAt,
}: TicketFormProps) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState<string>();
  const [previewing, setPreviewing] = useState(false);
  const [saving, startSaving] = useTransition();

  const editing = ticketNo !== undefined;
  const needsMarketer = values.truckType !== "internal";
  const cancelHref = editing ? `/ticket-history/${ticketNo}` : "/loading-program";
  const requested = toLitres(values.requestedLitres);
  const allocated = allocatedLitres(values);

  const error = (key: string) => errors[key]?.[0];
  const describedBy = (id: string, key: string) =>
    errors[key] ? { "aria-invalid": true, "aria-describedby": `${id}-error` } : {};

  function update(changes: Partial<TicketFormValues>) {
    setValues((current) => ({ ...current, ...changes }));
  }

  function updateDestination(index: number, changes: Partial<DestinationValues>) {
    setValues((current) => ({
      ...current,
      destinations: current.destinations.map((destination, i) =>
        i === index ? { ...destination, ...changes } : destination,
      ),
    }));
  }

  function chooseCustomer(value: string) {
    const customer = customers.find((option) => option.id === Number(value));
    if (!customer) {
      update({ customerId: null });
      return;
    }

    update({
      customerId: customer.id,
      truckType: customer.kind,
      ...(customer.kind !== "internal" && {
        marketerName: customer.name,
        representative: customer.representative ?? "",
        marketerPhone: customer.phone ?? "",
      }),
    });
  }

  function showPreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = checkValues(values);
    setErrors(found);

    if (Object.keys(found).length > 0) {
      setMessage("Check the highlighted fields and try again.");
      return;
    }

    setMessage(undefined);
    setPreviewing(true);
    window.scrollTo({ top: 0 });
  }

  function save() {
    startSaving(async () => {
      // A successful save redirects to the ticket, so only failures come back.
      const failure = await saveTicket(toTicketInput(values, programItemId), ticketNo);
      if (!failure) return;

      setErrors(failure.fieldErrors);
      setMessage(failure.message);
      setPreviewing(false);
    });
  }

  if (previewing) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <TicketPreviewPanel
          ticket={draftPreview(values, {
            ticketId: ticketNo ?? "Issued on create",
            date: issuedAt.date,
            time: issuedAt.time,
            depot: terminals.find((terminal) => terminal.id === values.terminalId)?.name ?? "",
          })}
          officer={officer}
          onEdit={() => setPreviewing(false)}
          cancelHref={cancelHref}
          onConfirm={save}
          confirmLabel={editing ? "Save Changes" : "Create Ticket"}
          pending={saving}
        />
      </div>
    );
  }

  const formProblem = message ?? error("program_item_id");

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <form onSubmit={showPreview} noValidate className="space-y-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Loading Ticket</p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {editing ? `Edit Ticket ${ticketNo}` : "Generate Loading Ticket"}
            </h1>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href={cancelHref} className={buttonVariants({ variant: "secondary" })}>
              Cancel
            </Link>
            <Button type="submit">Preview Ticket</Button>
          </div>
        </div>

        {formProblem && (
          <div role="alert" className="rounded-xl bg-danger-surface px-4 py-3 text-sm font-medium text-danger">
            {formProblem}
            {message && error("program_item_id") && <p className="mt-1">{error("program_item_id")}</p>}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Basic Info</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <Field id="ticket-id" label="Ticket ID">
              <Input
                id="ticket-id"
                value={ticketNo ?? "Issued on create"}
                readOnly
                aria-readonly
                className="h-14 rounded-xl bg-muted/50 text-muted-foreground"
              />
            </Field>
            <Field id="date" label="Date">
              <Input
                id="date"
                value={issuedAt.date}
                readOnly
                aria-readonly
                className="h-14 rounded-xl bg-muted/50 text-muted-foreground"
              />
            </Field>
            <Field id="time" label="Time">
              <Input
                id="time"
                value={issuedAt.time}
                readOnly
                aria-readonly
                className="h-14 rounded-xl bg-muted/50 text-muted-foreground"
              />
            </Field>
            <Field id="customer" label="Customer" error={error("customer_id")} className="sm:col-span-2">
              <select
                id="customer"
                value={values.customerId ?? ""}
                onChange={(event) => chooseCustomer(event.target.value)}
                disabled={editing || programItemId !== undefined}
                className={selectClass}
                {...describedBy("customer", "customer_id")}
              >
                <option value="" disabled>
                  Choose a customer
                </option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} · {TRUCK_TYPE_LABEL[customer.kind]}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="terminal" label="Terminal" error={error("terminal_id")}>
              <select
                id="terminal"
                value={values.terminalId}
                onChange={(event) => update({ terminalId: Number(event.target.value) })}
                className={selectClass}
                {...describedBy("terminal", "terminal_id")}
              >
                {terminals.map((terminal) => (
                  <option key={terminal.id} value={terminal.id}>
                    {terminal.name}
                  </option>
                ))}
              </select>
            </Field>
            <p className="text-xs text-muted-foreground sm:col-span-3">
              The ticket number, date and time are issued when the ticket is created.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Truck Info</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <Field id="truck-type" label="Truck Type" error={error("truck_type")}>
              <select
                id="truck-type"
                value={values.truckType}
                onChange={(event) => update({ truckType: event.target.value as TruckType })}
                className={selectClass}
              >
                {TRUCK_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {TRUCK_TYPE_LABEL[type]}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="truck-number" label="Truck Number" error={error("truck_plate")}>
              <Input
                id="truck-number"
                value={values.truckPlate}
                onChange={(event) => update({ truckPlate: event.target.value })}
                placeholder="e.g. BDJ580XB"
                autoCapitalize="characters"
                className={cn(inputClass, "uppercase")}
                {...describedBy("truck-number", "truck_plate")}
              />
            </Field>
            <Field id="requested-litres" label="Requested Loading Amount (Litres)" error={error("requested_litres")}>
              <Input
                id="requested-litres"
                value={values.requestedLitres}
                onChange={(event) => update({ requestedLitres: event.target.value })}
                placeholder="e.g. 45,000"
                inputMode="numeric"
                className={inputClass}
                {...describedBy("requested-litres", "requested_litres")}
              />
            </Field>
            <Field id="product" label="Product" error={error("product")} className="sm:col-span-3">
              <select
                id="product"
                value={values.product}
                onChange={(event) => update({ product: event.target.value as Product })}
                className={selectClass}
              >
                {PRODUCTS.map((product) => (
                  <option key={product} value={product}>
                    {PRODUCT_LABEL[product]}
                  </option>
                ))}
              </select>
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Driver</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field id="driver-name" label="Driver's Name" error={error("driver.name")} hint="Optional — Safety sees it on the queue.">
              <Input
                id="driver-name"
                value={values.driverName}
                onChange={(event) => update({ driverName: event.target.value })}
                className={inputClass}
                {...describedBy("driver-name", "driver.name")}
              />
            </Field>
            <Field id="driver-phone" label="Driver's Phone Number" error={error("driver.phone")}>
              <Input
                id="driver-phone"
                type="tel"
                value={values.driverPhone}
                onChange={(event) => update({ driverPhone: event.target.value })}
                className={inputClass}
                {...describedBy("driver-phone", "driver.phone")}
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Destination / Distribution</CardTitle>
            <p
              className={cn(
                "text-sm font-medium",
                requested >= 1 && allocated === requested ? "text-success" : "text-muted-foreground",
              )}
            >
              {formatNumber(allocated)} of {requested >= 1 ? formatNumber(requested) : "—"} litres allocated
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {values.destinations.map((destination, index) => (
              <div key={index} className="rounded-2xl border border-border bg-surface p-5">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-foreground">Destination {index + 1}</p>
                  {values.destinations.length > 1 && (
                    <Button
                      variant="outline"
                      type="button"
                      aria-label={`Remove destination ${index + 1}`}
                      onClick={() =>
                        update({ destinations: values.destinations.filter((_, i) => i !== index) })
                      }
                      className="h-10 px-3 text-sm"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id={`station-${index}`} label="Station" error={error(`destinations.${index}.station`)}>
                    <Input
                      id={`station-${index}`}
                      value={destination.station}
                      onChange={(event) => updateDestination(index, { station: event.target.value })}
                      className={inputClass}
                      {...describedBy(`station-${index}`, `destinations.${index}.station`)}
                    />
                  </Field>
                  <Field
                    id={`litres-${index}`}
                    label="Quantity to be Discharged (Litres)"
                    error={error(`destinations.${index}.litres`)}
                  >
                    <Input
                      id={`litres-${index}`}
                      value={destination.litres}
                      onChange={(event) => updateDestination(index, { litres: event.target.value })}
                      inputMode="numeric"
                      className={inputClass}
                      {...describedBy(`litres-${index}`, `destinations.${index}.litres`)}
                    />
                  </Field>
                </div>
                <Field
                  id={`address-${index}`}
                  label="Address"
                  error={error(`destinations.${index}.address`)}
                  className="mt-4"
                >
                  <Input
                    id={`address-${index}`}
                    value={destination.address}
                    onChange={(event) => updateDestination(index, { address: event.target.value })}
                    className={inputClass}
                    {...describedBy(`address-${index}`, `destinations.${index}.address`)}
                  />
                </Field>
              </div>
            ))}

            <FieldError id="destinations-error" message={error("destinations")} />

            <Button
              type="button"
              variant="outline"
              className="inline-flex items-center gap-2"
              disabled={values.destinations.length >= 10}
              onClick={() =>
                update({ destinations: [...values.destinations, { station: "", address: "", litres: "" }] })
              }
            >
              <Plus className="size-4" />
              Add another destination
            </Button>
          </CardContent>
        </Card>

        {needsMarketer && (
          <Card>
            <CardHeader>
              <CardTitle>Marketer Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <FieldError id="marketer-error" message={error("marketer")} />
              <Field id="marketer" label="Marketer" error={error("marketer.name")} className="sm:col-start-1">
                <Input
                  id="marketer"
                  value={values.marketerName}
                  onChange={(event) => update({ marketerName: event.target.value })}
                  className={inputClass}
                  {...describedBy("marketer", "marketer.name")}
                />
              </Field>
              <Field id="representative" label="Representative" error={error("marketer.representative")}>
                <Input
                  id="representative"
                  value={values.representative}
                  onChange={(event) => update({ representative: event.target.value })}
                  className={inputClass}
                  {...describedBy("representative", "marketer.representative")}
                />
              </Field>
              <Field id="marketer-phone" label="Phone Number" error={error("marketer.phone")}>
                <Input
                  id="marketer-phone"
                  type="tel"
                  value={values.marketerPhone}
                  onChange={(event) => update({ marketerPhone: event.target.value })}
                  className={inputClass}
                  {...describedBy("marketer-phone", "marketer.phone")}
                />
              </Field>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}
