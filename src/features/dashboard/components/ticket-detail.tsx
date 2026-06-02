import { type ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./status-badge";
import type { TicketDetail as TicketDetailData } from "@/features/dashboard/data/tickets";

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

interface TicketDetailProps {
  ticket: TicketDetailData;
}

export function TicketDetail({ ticket }: TicketDetailProps) {
  const editable = ticket.status !== "approved";
  const multi = ticket.destinations.length > 1;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href="/ticket-history"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Back
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-bold tracking-tight text-foreground">
            Ticket {ticket.id} | {ticket.terminal}
          </h1>
          <StatusBadge status={ticket.status} />
        </div>
        {editable && (
          <Button variant="secondary" size="sm">
            Edit
            <Pencil className="size-4" />
          </Button>
        )}
      </div>

      <Section title="Truck Information">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Truck Type" value={ticket.truckType} />
          <Field label="Truck Number" value={ticket.truckNumber} />
          <Field label="Product" value={ticket.product} />
          <Field label="Requested Loading Amount" value={ticket.requestedAmount} />
        </div>
      </Section>

      <Section title="Destination/Distribution Information">
        <div className="space-y-5">
          {ticket.destinations.map((destination, index) => (
            <div
              key={index}
              className={cn("grid gap-4", multi && "grid-cols-[2.5rem_1fr]")}
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
                    value={destination.amount}
                  />
                </div>
                <Field label="Address" value={destination.address} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Marketer's Information">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Marketer" value={ticket.marketerInfo.marketer} />
          <Field label="Name" value={ticket.marketerInfo.representative} />
          <Field label="Phone Number" value={ticket.marketerInfo.phone} />
        </div>
      </Section>
    </div>
  );
}
