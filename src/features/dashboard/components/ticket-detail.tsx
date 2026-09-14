import { type ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, CircleCheck, Clock, Pencil, Printer, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDepotDate, formatDepotTime, formatLitres, formatVariance } from "@/lib/format";
import { REJECTION_REASON_LABEL, TRUCK_TYPE_LABEL } from "@/domain/labels";
import { buttonVariants } from "@/components/ui/button";
import type { TicketDetail as TicketDetailData } from "@/lib/api/types";
import { PRODUCT_LABEL } from "../ticket-values";
import { StatusBadge } from "./status-badge";

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

/** "14:06, 25th August, 2026" in depot time. */
function at(timestamp: string): string {
  return `${formatDepotTime(timestamp)}, ${formatDepotDate(timestamp)}`;
}

interface TicketDetailProps {
  ticket: TicketDetailData;
  /** Confirmation after the ticket was generated or edited. */
  notice?: string;
}

export function TicketDetail({ ticket, notice }: TicketDetailProps) {
  // Logistics can edit only until Safety decides (TicketStatus::isEditable in bovas-api).
  const editable = ticket.status === "awaiting_safety";
  const multi = ticket.destinations.length > 1;
  const inspection = ticket.inspection;
  const approved = inspection?.result === "approved";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href="/ticket-history"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Back
      </Link>

      {notice && (
        <p role="status" className="flex items-center gap-2 rounded-xl bg-success-surface px-4 py-3 text-sm font-medium text-success">
          <CircleCheck className="size-4 shrink-0" />
          {notice}
        </p>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-lg font-bold tracking-tight text-foreground">
              Ticket {ticket.ticket_no} | {ticket.terminal.name}
            </h1>
            <StatusBadge status={ticket.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {ticket.customer.name} · Generated at {at(ticket.created_at)} by {ticket.created_by.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/ticket-preview?ticket=${ticket.ticket_no}`}
            className={buttonVariants({ variant: "secondary", size: "sm" })}
          >
            <Printer className="size-4" />
            View Ticket
          </Link>
          {editable && (
            <Link
              href={`/generate-ticket?edit=${ticket.ticket_no}`}
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              Edit
              <Pencil className="size-4" />
            </Link>
          )}
        </div>
      </div>

      <Section title="Safety Inspection">
        {inspection ? (
          <div className="space-y-4">
            <p
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium",
                approved ? "bg-success-surface text-success" : "bg-danger-surface text-danger",
              )}
            >
              {approved ? (
                <CircleCheck className="size-4 shrink-0" />
              ) : (
                <TriangleAlert className="size-4 shrink-0" />
              )}
              {approved
                ? "Approved for loading"
                : `Rejected${inspection.reason_code ? ` — ${REJECTION_REASON_LABEL[inspection.reason_code]}` : ""}`}
              {inspection.notes ? `: ${inspection.notes}` : ""}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Inspected By" value={inspection.inspector.name} />
              <Field label="Inspected At" value={at(inspection.inspected_at)} />
            </div>
          </div>
        ) : (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-4" />
            Waiting in the Safety queue. You can still edit the ticket until Safety inspects the truck.
          </p>
        )}
      </Section>

      {(ticket.loading || ticket.waybill || ticket.gate_cleared_at) && (
        <Section title="Loading & Dispatch">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ticket.loading && (
              <>
                <Field label="Litres Loaded" value={formatLitres(ticket.loading.actual_litres)} />
                <Field label="Variance" value={formatVariance(ticket.loading.variance_litres)} />
                <Field
                  label="Loading Status"
                  value={ticket.loading.outcome === "overloaded" ? "Overloaded" : "Within Limit"}
                />
                <Field label="Loaded At" value={at(ticket.loading.recorded_at)} />
              </>
            )}
            {ticket.waybill && (
              <div className="rounded-xl border border-border px-4 py-3">
                <p className="text-xs text-muted-foreground">Waybill</p>
                <Link
                  href={`/waybills/${ticket.waybill.waybill_no}`}
                  className="mt-1 inline-block text-sm font-semibold text-foreground underline underline-offset-4"
                >
                  {ticket.waybill.waybill_no}
                </Link>
              </div>
            )}
            {ticket.waybill && <Field label="Waybill Issued" value={at(ticket.waybill.issued_at)} />}
            {ticket.gate_cleared_at && <Field label="Gate Cleared" value={at(ticket.gate_cleared_at)} />}
          </div>
        </Section>
      )}

      <Section title="Truck Information">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Truck Type" value={TRUCK_TYPE_LABEL[ticket.truck.type]} />
          <Field label="Truck Number" value={ticket.truck.plate} />
          <Field label="Product" value={PRODUCT_LABEL[ticket.product]} />
          <Field label="Requested Loading Amount" value={formatLitres(ticket.requested_litres)} />
        </div>
      </Section>

      <Section title="Driver's Information">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" value={ticket.driver?.name ?? "Not recorded"} />
          <Field label="Phone Number" value={ticket.driver?.phone ?? "Not recorded"} />
        </div>
      </Section>

      <Section title="Destination/Distribution Information">
        <div className="space-y-5">
          {ticket.destinations.map((destination, index) => (
            <div key={index} className={cn("grid gap-4", multi && "grid-cols-[2.5rem_1fr]")}>
              {multi && (
                <span className="text-lg font-extrabold text-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
              )}
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Station" value={destination.station} />
                  <Field label="Amount to be Discharged" value={formatLitres(destination.litres)} />
                </div>
                <Field label="Address" value={destination.address} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {ticket.marketer && (
        <Section title="Marketer's Information">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Marketer" value={ticket.marketer.name} />
            <Field label="Name" value={ticket.marketer.representative} />
            <Field label="Phone Number" value={ticket.marketer.phone} />
          </div>
        </Section>
      )}
    </div>
  );
}
