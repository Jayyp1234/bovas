import { type ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatLitres } from "@/lib/format";
import type { PartyKind, Waybill } from "../data/waybills";

const PARTY_TITLE: Record<PartyKind, string> = {
  marketer: "Marketer's Information",
  industrial: "Industrial Company Information",
  internal: "",
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <div className="mb-3 inline-flex rounded-lg bg-muted px-4 py-2 text-sm font-medium text-foreground">
        {title}
      </div>
      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
        {children}
      </div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

export function WaybillActivity({ waybill }: { waybill: Waybill }) {
  const multi = waybill.destinations.length > 1;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href="/dispatch/waybill-history"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Back
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold tracking-tight text-foreground">
          Waybill {waybill.id} | {waybill.depot}
        </h1>
        <Button variant="secondary" size="sm">
          Edit
          <Pencil className="size-4" />
        </Button>
      </div>

      <Section title="Truck Information">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Truck Type" value={waybill.truckType} />
          <Field label="Truck Number" value={waybill.truckNumber} />
          <Field label="Product" value={waybill.product} />
          <Field
            label="Requested Loading Amount"
            value={formatLitres(waybill.requestedQuantity)}
          />
        </div>
      </Section>

      <Section title="Loading Summary">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {waybill.compartments.map((compartment, index) => (
              <Field
                key={index}
                label={`Compartment ${index + 1}`}
                value={formatLitres(compartment.litres)}
              />
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Total Amount Loaded"
              value={formatLitres(waybill.loadedQuantity)}
            />
            <Field label="Loader" value={waybill.loader} />
          </div>
        </div>
      </Section>

      <Section title="Destination/Distribution Information">
        <div className="space-y-5">
          {waybill.destinations.map((destination, index) => (
            <div
              key={index}
              className={
                multi ? "grid grid-cols-[2.5rem_1fr] gap-4" : "grid gap-4"
              }
            >
              {multi && (
                <span className="text-lg font-extrabold text-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
              )}
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Station" value={destination.station} />
                  <Field
                    label="Amount to be Discharged"
                    value={formatLitres(destination.quantityDischarged)}
                  />
                </div>
                <Field label="Address" value={destination.address} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {waybill.partyKind !== "internal" && waybill.party && (
        <Section title={PARTY_TITLE[waybill.partyKind]}>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Company" value={waybill.party.company} />
            <Field label="Representative" value={waybill.party.representative} />
            <Field label="Phone Number" value={waybill.party.phone} />
          </div>
        </Section>
      )}

      <Section title="Driver's Information">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Driver's Name" value={waybill.driver.name} />
          <Field label="Phone Number" value={waybill.driver.phone} />
        </div>
      </Section>
    </div>
  );
}
