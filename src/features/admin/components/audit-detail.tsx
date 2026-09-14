import { type ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, CircleCheck, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDepotDate, formatDepotTime, formatLitres, formatVariance } from "@/lib/format";
import { AUDIT_STATUS_LABEL, TRUCK_TYPE_LABEL } from "@/domain/labels";
import type { AuditDetail as AuditDetailData, AuditStatus } from "@/lib/api/types";

const STATUS_BADGE_CLASS: Record<AuditStatus, string> = {
  completed: "bg-success-surface text-success",
  pending: "bg-warning-surface text-warning",
  failed: "bg-danger-surface text-danger",
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

export function AuditDetail({ record }: { record: AuditDetailData }) {
  const summary = record.loading_summary;
  const isOverloaded = summary?.outcome === "overloaded";

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
          {record.truck.plate} - {formatDepotDate(record.date)} | {record.terminal.name}
        </h1>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-sm font-medium",
            STATUS_BADGE_CLASS[record.status],
          )}
        >
          {AUDIT_STATUS_LABEL[record.status]}
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
          <Field label="Truck Type" value={TRUCK_TYPE_LABEL[record.truck.type]} />
          <Field label="Truck Number" value={record.truck.plate} />
          <Field label="Product" value={record.product} />
          <Field label="Capacity" value={formatLitres(record.truck.capacity_litres)} />
        </div>
      </Section>

      {summary && (
        <Section title="Loading Summary">
          <div className={fieldGrid}>
            <Field label="Requested Quantity" value={formatLitres(summary.requested_litres)} />
            <Field label="Actual Loaded Quantity" value={formatLitres(summary.actual_litres)} />
            <Field label="Variance" value={formatVariance(summary.variance_litres)} />
            <div className="rounded-xl border border-border px-4 py-3">
              <p className="text-xs text-muted-foreground">Status</p>
              <div
                className={cn(
                  "mt-2 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-on-solid",
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
          <Field label="Loading Ticket ID" value={record.ticket_no} />
          {record.waybill_no && (
            <Field
              label="Waybill ID"
              value={
                <Link href={`/waybills/${record.waybill_no}`} className="underline underline-offset-4">
                  {record.waybill_no}
                </Link>
              }
            />
          )}
        </div>
      </Section>

      <Section title="Timeline">
        <div className={fieldGrid}>
          {record.timeline.map((entry) => (
            <Field
              key={`${entry.event}-${entry.at}`}
              label={entry.label}
              value={formatDepotTime(entry.at)}
            />
          ))}
        </div>
      </Section>

      <Section title="Staff on Duty">
        <div className={fieldGrid}>
          {record.staff_on_duty.map((member) => (
            <Field key={member.role_label} label={member.role_label} value={member.name} />
          ))}
        </div>
      </Section>

      {isOverloaded && record.overload_approved_by && (
        <Section title="Overloading Approved By">
          <div className={fieldGrid}>
            <Field label="Admin" value={record.overload_approved_by.name} />
          </div>
        </Section>
      )}
    </div>
  );
}
