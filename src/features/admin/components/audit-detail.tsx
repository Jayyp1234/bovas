import { type ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, CircleCheck, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuditRecord, AuditStatus } from "../data/audit";

const STATUS_BADGE: Record<AuditStatus, { label: string; className: string }> = {
  completed: { label: "Completed", className: "bg-success-surface text-success" },
  pending: { label: "Pending", className: "bg-warning-surface text-warning" },
  failed: { label: "Failed", className: "bg-danger-surface text-danger" },
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

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-border px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

const fieldGrid = "grid gap-4 sm:grid-cols-2 lg:grid-cols-4";

export function AuditDetail({ record }: { record: AuditRecord }) {
  const badge = STATUS_BADGE[record.status];
  const isCompleted = record.status === "completed";
  const isOverloaded = record.outcome === "overloaded";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href="/admin/audit"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Back
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-lg font-bold tracking-tight text-foreground">
          {record.truckNumber} - {record.date} | {record.terminal}
        </h1>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-sm font-medium",
            badge.className,
          )}
        >
          {badge.label}
        </span>
      </div>

      {record.reason && (
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium",
            record.status === "failed"
              ? "bg-danger-surface text-danger"
              : "bg-warning-surface text-warning",
          )}
        >
          <TriangleAlert className="size-4 shrink-0" />
          Reason: {record.reason}
        </div>
      )}

      <Section title="Truck Information">
        <div className={fieldGrid}>
          <Field label="Truck Type" value={record.truckType} />
          <Field label="Truck Number" value={record.truckNumber} />
          <Field label="Product" value={record.product} />
          <Field label="Capacity" value={record.capacity} />
        </div>
      </Section>

      {isCompleted && (
        <Section title="Loading Summary">
          <div className={fieldGrid}>
            <Field label="Requested Quantity" value={record.requestedQuantity} />
            <Field label="Actual Loaded Quantity" value={record.actualLoaded} />
            <Field label="Variance" value={record.variance} />
            <div className="rounded-xl border border-border px-4 py-3">
              <p className="text-xs text-muted-foreground">Status</p>
              <div
                className={cn(
                  "mt-2 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-white",
                  isOverloaded ? "bg-danger" : "bg-success",
                )}
              >
                {isOverloaded ? (
                  <TriangleAlert className="size-4" />
                ) : (
                  <CircleCheck className="size-4" />
                )}
                {isOverloaded ? "Overloaded" : "Within Limit"}
              </div>
            </div>
          </div>
        </Section>
      )}

      <Section title="Ticket Details">
        <div className={fieldGrid}>
          <Field label="Loading Ticket ID" value={record.loadingTicketId} />
          {isCompleted && record.waybillId && (
            <Field label="Waybill ID" value={record.waybillId} />
          )}
        </div>
      </Section>

      <Section title="Timeline">
        <div className={fieldGrid}>
          {record.timeline.map((entry) => (
            <Field key={entry.label} label={entry.label} value={entry.time} />
          ))}
        </div>
      </Section>

      <Section title="Staff on Duty">
        <div className={fieldGrid}>
          {record.staff.map((member) => (
            <Field key={member.role} label={member.role} value={member.name} />
          ))}
        </div>
      </Section>

      {isOverloaded && record.overloadingApprovedBy && (
        <Section title="Overloading Approved By">
          <div className={fieldGrid}>
            <Field label="Admin" value={record.overloadingApprovedBy} />
          </div>
        </Section>
      )}
    </div>
  );
}
