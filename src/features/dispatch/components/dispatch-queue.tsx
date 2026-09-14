"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleCheck, Clock, Droplet, Inbox, Printer, TriangleAlert, Truck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { formatLitres, formatNumber } from "@/lib/format";
import { formatWait } from "@/lib/wait";
import { TRUCK_TYPE_LABEL } from "@/domain/labels";
import { loadingOutcome, overloadAllowance } from "@/domain/overload";
import type { DispatchQueueItem, DispatchStage } from "@/lib/api/types";
import {
  clearGateAction,
  issueWaybillAction,
  recordLoadingAction,
  type DispatchResult,
} from "../actions";

/** How often the queue looks for trucks that have just reached this stage. */
const REFRESH_INTERVAL_MS = 30_000;

const COPY: Record<DispatchStage, { title: string; description: string; empty: string }> = {
  loading: {
    title: "Loading Queue",
    description: "Trucks Safety has approved. Record the litres each one actually loaded.",
    empty: "No trucks are waiting to load.",
  },
  waybill: {
    title: "Waybills",
    description: "Loaded trucks. Issue each one's waybill before it leaves.",
    empty: "No loaded trucks are waiting for a waybill.",
  },
  gate: {
    title: "Gate",
    description: "Trucks with a waybill. Clear each one as it leaves the depot.",
    empty: "No trucks are waiting at the gate.",
  },
};

/** "45,000", "45000" or "45,000 litres" → 45000; anything else → NaN. */
function parseLitres(value: string): number {
  const digits = value.replace(/litres?/i, "").replace(/[,\s]/g, "");
  return /^\d+$/.test(digits) ? Number(digits) : Number.NaN;
}

interface DispatchQueueProps {
  stage: DispatchStage;
  items: DispatchQueueItem[];
  /** The admin's overload tolerance, from the queue's meta. */
  tolerancePercent: number;
}

export function DispatchQueue({ stage, items, tolerancePercent }: DispatchQueueProps) {
  const router = useRouter();
  const copy = COPY[stage];
  const [selectedNo, setSelectedNo] = useState<string | undefined>(items[0]?.ticket_no);
  const [litres, setLitres] = useState("");
  const [result, setResult] = useState<DispatchResult | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const timer = window.setInterval(() => router.refresh(), REFRESH_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [router]);

  const selected = items.find((item) => item.ticket_no === selectedNo) ?? items[0];
  const actual = parseLitres(litres);
  const hasLitres = Number.isInteger(actual) && actual >= 1;
  const preview =
    selected && hasLitres
      ? loadingOutcome(actual, selected.requested_litres, selected.truck.capacity_litres, tolerancePercent)
      : null;

  function select(ticketNo: string) {
    if (ticketNo === selected?.ticket_no) return;
    setSelectedNo(ticketNo);
    setLitres("");
    setResult(null);
  }

  function run(step: (ticketNo: string) => Promise<DispatchResult>) {
    if (!selected) return;
    const ticketNo = selected.ticket_no;

    startTransition(async () => {
      const response = await step(ticketNo);
      setResult(response);
      if (response.ok) {
        setLitres("");
        setSelectedNo(items.find((item) => item.ticket_no !== ticketNo)?.ticket_no);
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <Card className="flex flex-col overflow-hidden">
        <div className="p-5">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-foreground">{copy.title}</h1>
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
              {items.length}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{copy.description}</p>
        </div>

        <div className="flex flex-col gap-3 border-t border-border p-5">
          {items.map((item) => {
            const isSelected = item.ticket_no === selected?.ticket_no;
            return (
              <button
                key={item.ticket_no}
                type="button"
                aria-pressed={isSelected}
                onClick={() => select(item.ticket_no)}
                className={cn(
                  "w-full rounded-xl border p-4 text-left transition-colors",
                  isSelected ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Truck className="size-4 text-primary" />
                    {item.truck.plate} · Ticket #{item.ticket_no}
                  </span>
                  <span
                    className="flex items-center gap-1 text-xs text-muted-foreground"
                    title="Waiting at this stage"
                  >
                    <Clock className="size-3.5" />
                    {formatWait(item.waiting_minutes)}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2 text-sm text-muted-foreground">
                  <span>
                    {item.customer.name} · {TRUCK_TYPE_LABEL[item.truck.type]}
                  </span>
                  <span className="flex items-center gap-1">
                    <Droplet className="size-3.5" />
                    {item.product} - {formatLitres(item.requested_litres)}
                  </span>
                </div>
              </button>
            );
          })}
          {items.length === 0 && (
            <p className="flex flex-col items-center gap-2 py-12 text-center text-sm text-muted-foreground">
              <Inbox className="size-8 text-subtle" />
              {copy.empty} Trucks appear here automatically.
            </p>
          )}
        </div>
      </Card>

      <Card className="flex flex-col self-start p-5">
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          {selected ? `Truck ${selected.truck.plate}` : "Nothing to do"}
        </h2>

        {result && (
          <div
            role={result.ok ? "status" : "alert"}
            className={cn(
              "mt-4 space-y-2 rounded-xl px-3 py-2.5 text-sm font-medium",
              result.ok ? "bg-success-surface text-success" : "bg-danger-surface text-danger",
            )}
          >
            <p className="flex gap-2">
              {result.ok ? (
                <CircleCheck className="mt-0.5 size-4 shrink-0" />
              ) : (
                <TriangleAlert className="mt-0.5 size-4 shrink-0" />
              )}
              {result.message}
            </p>
            {result.ok && result.waybillNo && (
              <Link
                href={`/waybills/${result.waybillNo}`}
                className={buttonVariants({ variant: "secondary", size: "sm" })}
              >
                <Printer className="size-4" />
                Print Waybill {result.waybillNo}
              </Link>
            )}
          </div>
        )}

        {selected ? (
          <>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Ticket</dt>
                <dd className="font-semibold text-foreground">#{selected.ticket_no}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Customer</dt>
                <dd className="font-semibold text-foreground">{selected.customer.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Requested</dt>
                <dd className="font-semibold text-foreground">
                  {selected.product} · {formatLitres(selected.requested_litres)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Truck Capacity</dt>
                <dd className="font-semibold text-foreground">
                  {selected.truck.capacity_litres > 0
                    ? formatLitres(selected.truck.capacity_litres)
                    : "Not registered"}
                </dd>
              </div>
            </dl>

            {stage === "loading" && (
              <form
                className="mt-6 space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (hasLitres) run((ticketNo) => recordLoadingAction(ticketNo, actual));
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="actual-litres">Litres Loaded</Label>
                  <Input
                    id="actual-litres"
                    value={litres}
                    onChange={(event) => setLitres(event.target.value)}
                    inputMode="numeric"
                    placeholder={`e.g. ${formatNumber(selected.requested_litres)}`}
                    className="h-12 rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground">
                    Up to {formatNumber(overloadAllowance(selected.requested_litres, tolerancePercent))} litres
                    is within the {tolerancePercent}% tolerance
                    {selected.truck.capacity_litres > 0
                      ? `, and the truck holds ${formatNumber(selected.truck.capacity_litres)}.`
                      : "."}
                  </p>
                </div>

                {preview && (
                  <p
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold",
                      preview === "overloaded"
                        ? "bg-danger-surface text-danger"
                        : "bg-success-surface text-success",
                    )}
                  >
                    {preview === "overloaded" ? (
                      <TriangleAlert className="size-4 shrink-0" />
                    ) : (
                      <CircleCheck className="size-4 shrink-0" />
                    )}
                    {preview === "overloaded"
                      ? "Overloaded — an admin must approve it before the waybill."
                      : `Within limit (${actual - selected.requested_litres >= 0 ? "+" : ""}${formatNumber(actual - selected.requested_litres)} litres).`}
                  </p>
                )}

                <Button type="submit" className="w-full" disabled={!hasLitres || pending}>
                  {pending ? "Recording…" : "Record Loading"}
                </Button>
              </form>
            )}

            {stage === "waybill" && (
              <div className="mt-6 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Loaded and ready to leave. The waybill number is issued when you confirm.
                </p>
                <Button className="w-full" disabled={pending} onClick={() => run(issueWaybillAction)}>
                  {pending ? "Issuing…" : "Issue Waybill"}
                </Button>
              </div>
            )}

            {stage === "gate" && (
              <div className="mt-6 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Check the driver has the waybill, then clear the truck to leave. This closes the
                  ticket.
                </p>
                <Button className="w-full" disabled={pending} onClick={() => run(clearGateAction)}>
                  {pending ? "Clearing…" : "Clear Gate"}
                </Button>
              </div>
            )}
          </>
        ) : (
          <p className="mt-6 flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
            <CircleCheck className="size-8 text-subtle" />
            {copy.empty}
          </p>
        )}
      </Card>
    </div>
  );
}
