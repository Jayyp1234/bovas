import { type ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDepotDate } from "@/lib/format";
import { REJECTION_REASON_LABEL, TRUCK_TYPE_LABEL } from "@/domain/labels";
import type { Inspection } from "@/lib/api/types";

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

export function SafetyTicketDetail({ inspection }: { inspection: Inspection }) {
  const rejected = inspection.result === "rejected";
  const reason =
    inspection.notes ??
    (inspection.reason_code ? REJECTION_REASON_LABEL[inspection.reason_code] : null);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href="/safety/history"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Back
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-lg font-bold tracking-tight text-foreground">
          {inspection.truck.plate} - {formatDepotDate(inspection.inspected_at)} |{" "}
          {inspection.terminal.name}
        </h1>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-sm font-medium",
            rejected
              ? "bg-danger-surface text-danger"
              : "bg-success-surface text-success",
          )}
        >
          {rejected ? "Rejected" : "Approved"}
        </span>
      </div>

      {rejected && reason && (
        <div className="flex items-center gap-2 rounded-xl bg-danger-surface px-4 py-3 text-sm font-medium text-danger">
          <TriangleAlert className="size-4 shrink-0" />
          Reason: {reason}
        </div>
      )}

      <Section title="Truck Information">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Truck Type" value={TRUCK_TYPE_LABEL[inspection.truck.type]} />
          <Field label="Customer" value={inspection.customer.name} />
          <Field label="Loading Ticket ID" value={inspection.ticket_no} />
        </div>
      </Section>

      <Section title="Driver's Information">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" value={inspection.driver?.name ?? "Not recorded"} />
          <Field label="Phone Number" value={inspection.driver?.phone ?? "Not recorded"} />
        </div>
      </Section>
    </div>
  );
}
