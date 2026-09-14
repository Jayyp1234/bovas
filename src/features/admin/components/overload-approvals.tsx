"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CircleCheck, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatDepotTime, formatLitres, formatVariance } from "@/lib/format";
import type { OverloadDecision, TicketDetail } from "@/lib/api/types";
import { decideOverloadAction, type OverloadDecisionResult } from "../actions";

interface Pending {
  ticket: TicketDetail;
  decision: OverloadDecision;
}

/** Overloaded trucks waiting for an admin, with Approve and Deny. Hidden when there are none. */
export function OverloadApprovals({ tickets }: { tickets: TicketDetail[] }) {
  const [deciding, setDeciding] = useState<Pending | null>(null);
  const [note, setNote] = useState("");
  const [result, setResult] = useState<OverloadDecisionResult | null>(null);
  const [pending, startTransition] = useTransition();

  if (tickets.length === 0 && !result) {
    return null;
  }

  function open(ticket: TicketDetail, decision: OverloadDecision) {
    setDeciding({ ticket, decision });
    setNote("");
    setResult(null);
  }

  function confirm() {
    if (!deciding) return;
    const { ticket, decision } = deciding;

    startTransition(async () => {
      const response = await decideOverloadAction(ticket.ticket_no, {
        decision,
        note: note.trim() || null,
      });
      setResult(response);
      if (response.ok) setDeciding(null);
    });
  }

  const approving = deciding?.decision === "approved";

  return (
    <Card className="border-danger/30 p-5">
      <div className="flex items-center gap-2">
        <TriangleAlert className="size-5 text-danger" />
        <h2 className="text-base font-semibold text-foreground">Overload Approvals</h2>
        {tickets.length > 0 && (
          <span className="rounded-full bg-danger px-2 py-0.5 text-xs font-semibold text-on-solid">
            {tickets.length}
          </span>
        )}
      </div>

      {result && !deciding && (
        <p
          role={result.ok ? "status" : "alert"}
          className={cn(
            "mt-4 flex gap-2 rounded-xl px-3 py-2.5 text-sm font-medium",
            result.ok ? "bg-success-surface text-success" : "bg-danger-surface text-danger",
          )}
        >
          {result.ok ? <CircleCheck className="mt-0.5 size-4 shrink-0" /> : <TriangleAlert className="mt-0.5 size-4 shrink-0" />}
          {result.message}
        </p>
      )}

      <ul className="mt-4 divide-y divide-border">
        {tickets.map((ticket) => (
          <li key={ticket.ticket_no} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm">
              <p className="font-semibold text-foreground">
                {ticket.truck.plate} ·{" "}
                <Link href={`/admin/audit/${ticket.ticket_no}`} className="underline underline-offset-4">
                  Ticket #{ticket.ticket_no}
                </Link>{" "}
                · {ticket.customer.name}
              </p>
              {ticket.loading && (
                <p className="mt-1 text-muted-foreground">
                  Loaded {formatLitres(ticket.loading.actual_litres)} against{" "}
                  {formatLitres(ticket.requested_litres)} requested (
                  <span className="font-medium text-danger">{formatVariance(ticket.loading.variance_litres)}</span>) by{" "}
                  {ticket.loading.loader.name} at {formatDepotTime(ticket.loading.recorded_at)}
                </p>
              )}
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="secondary" size="sm" onClick={() => open(ticket, "denied")}>
                Deny
              </Button>
              <Button size="sm" onClick={() => open(ticket, "approved")}>
                Approve
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <Dialog
        open={deciding !== null}
        onClose={() => {
          if (!pending) setDeciding(null);
        }}
        title={approving ? "Approve Overload" : "Deny Overload"}
        className="max-w-sm"
        description={
          deciding && (
            <>
              Truck <span className="font-semibold text-foreground">{deciding.ticket.truck.plate}</span>{" "}
              {approving
                ? "will get its waybill and leave with this load."
                : "won't leave with this load. Tell Dispatch why."}
            </>
          )
        }
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            confirm();
          }}
          className="space-y-3"
        >
          <textarea
            aria-label="Note for Dispatch"
            placeholder={approving ? "Optional note" : "e.g. Offload 900 litres and record the load again"}
            rows={3}
            maxLength={500}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="w-full rounded-xl border border-input bg-surface p-3 text-sm text-foreground placeholder:text-subtle focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          />
          {result && !result.ok && (
            <p role="alert" className="text-sm text-danger">
              {result.message}
            </p>
          )}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setDeciding(null)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" size="sm" variant={approving ? "primary" : "destructive"} disabled={pending}>
              {pending ? "Saving…" : approving ? "Approve" : "Deny"}
            </Button>
          </div>
        </form>
      </Dialog>
    </Card>
  );
}
