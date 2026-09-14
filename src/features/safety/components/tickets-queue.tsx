"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Ticket,
  Clock,
  Droplet,
  ChevronUp,
  ChevronDown,
  CircleCheck,
  Inbox,
  TriangleAlert,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatLitres } from "@/lib/format";
import { matchesQuery } from "@/lib/search";
import { formatWait } from "@/lib/wait";
import {
  REJECTION_REASON_LABEL,
  TRUCK_TYPE_FILTERS,
  TRUCK_TYPE_LABEL,
  type TruckTypeFilter,
} from "@/domain/labels";
import type { ChecklistItem, InspectionInput, QueueTicket, RejectionReason } from "@/lib/api/types";
import { submitInspection } from "../actions";

/** How often the queue looks for tickets Logistics has just generated. */
const REFRESH_INTERVAL_MS = 30_000;

const selectClass =
  "flex h-11 w-full rounded-xl border border-input bg-surface px-3.5 text-sm text-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";

interface ChecklistSection {
  no: number;
  title: string;
  items: ChecklistItem[];
}

/** Groups the flat checklist into its numbered sections, keeping the API's order. */
function toSections(checklist: ChecklistItem[]): ChecklistSection[] {
  const sections: ChecklistSection[] = [];
  for (const item of checklist) {
    const current = sections.at(-1);
    if (current?.no === item.section_no) {
      current.items.push(item);
    } else {
      sections.push({ no: item.section_no, title: item.section_title, items: [item] });
    }
  }
  return sections;
}

function Switch({ checked, label, onClick }: { checked: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
        checked ? "bg-foreground" : "bg-switch-track",
      )}
    >
      <span
        className={cn(
          "inline-block size-4 transform rounded-full bg-surface transition-transform",
          checked ? "translate-x-[18px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

type Answers = InspectionInput["checks"];

interface Feedback {
  tone: "success" | "error";
  text: string;
}

interface TicketsQueueProps {
  queue: QueueTicket[];
  /** Tickets waiting in the queue. */
  total: number;
  checklist: ChecklistItem[];
}

export function TicketsQueue({ queue, total, checklist }: TicketsQueueProps) {
  const router = useRouter();
  const sections = toSections(checklist);
  const toggles = checklist.filter((item) => item.input === "toggle");

  const [tab, setTab] = useState<TruckTypeFilter>("all");
  const [query, setQuery] = useState("");
  const [selectedNo, setSelectedNo] = useState<string | undefined>(queue[0]?.ticket_no);
  const [answers, setAnswers] = useState<Answers>({});
  const [openSections, setOpenSections] = useState<Set<number>>(
    () => new Set(sections.map((section) => section.no)),
  );
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState<RejectionReason | "">("");
  const [notes, setNotes] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const timer = window.setInterval(() => router.refresh(), REFRESH_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [router]);

  const rows = queue.filter(
    (ticket) =>
      (tab === "all" || ticket.truck.type === tab) &&
      matchesQuery(query, ticket.ticket_no, ticket.truck.plate, ticket.driver?.name),
  );
  const selected = queue.find((ticket) => ticket.ticket_no === selectedNo) ?? queue[0];
  const everyItemChecked = toggles.every((item) => answers[item.key] === true);

  function resetChecklist() {
    setAnswers({});
    setReason("");
    setNotes("");
  }

  function select(ticketNo: string) {
    if (ticketNo === selected?.ticket_no) return;
    setSelectedNo(ticketNo);
    resetChecklist();
    setFeedback(null);
  }

  function toggleSection(no: number) {
    setOpenSections((current) => {
      const next = new Set(current);
      if (next.has(no)) next.delete(no);
      else next.add(no);
      return next;
    });
  }

  function decide(decision: Omit<InspectionInput, "checks">) {
    if (!selected) return;
    const { ticket_no: ticketNo, truck } = selected;
    // Every item gets an answer: unanswered toggles are "not present", counts are zero.
    const checks: Answers = Object.fromEntries(
      checklist.map((item) => [item.key, answers[item.key] ?? (item.input === "count" ? 0 : false)]),
    );

    startTransition(async () => {
      const outcome = await submitInspection(ticketNo, { ...decision, checks });
      if (!outcome.ok) {
        setFeedback({ tone: "error", text: outcome.message });
        return;
      }

      setRejectOpen(false);
      resetChecklist();
      setSelectedNo(queue.find((ticket) => ticket.ticket_no !== ticketNo)?.ticket_no);
      setFeedback({
        tone: "success",
        text:
          outcome.result === "approved"
            ? `Ticket #${ticketNo} (${truck.plate}) is approved for loading.`
            : `Ticket #${ticketNo} (${truck.plate}) was rejected. Logistics has been told.`,
      });
    });
  }

  function reject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (reason) decide({ result: "rejected", reason_code: reason, notes: notes.trim() || null });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <Card className="flex flex-col overflow-hidden">
        <div className="flex items-center gap-2 p-5">
          <h1 className="text-lg font-bold tracking-tight text-foreground">
            Loading Tickets Queue
          </h1>
          <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
            {total}
          </span>
        </div>

        <div className="px-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Tickets"
              aria-label="Search tickets"
              className="h-10 pl-9 text-sm"
            />
          </div>
        </div>

        <div
          role="tablist"
          aria-label="Truck type"
          className="mt-4 flex gap-6 border-b border-border px-5"
        >
          {TRUCK_TYPE_FILTERS.map((item) => {
            const active = tab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(item.key)}
                className={cn(
                  "-mb-px border-b-2 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 p-5">
          {rows.map((ticket) => {
            const isSelected = ticket.ticket_no === selected?.ticket_no;
            return (
              <button
                key={ticket.ticket_no}
                type="button"
                aria-pressed={isSelected}
                onClick={() => select(ticket.ticket_no)}
                className={cn(
                  "w-full rounded-xl border p-4 text-left transition-colors",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/50",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Ticket className="size-4 text-primary" />
                    Ticket #{ticket.ticket_no}
                  </span>
                  <span
                    className="flex items-center gap-1 text-xs text-muted-foreground"
                    title="Waiting since the ticket was generated"
                  >
                    <Clock className="size-3.5" />
                    {formatWait(ticket.waiting_minutes)}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2 text-sm text-muted-foreground">
                  <span>
                    {ticket.truck.plate} · {TRUCK_TYPE_LABEL[ticket.truck.type]}
                  </span>
                  <span className="flex items-center gap-1">
                    <Droplet className="size-3.5" />
                    {ticket.product} - {formatLitres(ticket.requested_litres)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {ticket.customer.name} · {ticket.driver?.name ?? "Driver not recorded"}
                </p>
              </button>
            );
          })}
          {rows.length === 0 && (
            <p className="flex flex-col items-center gap-2 py-12 text-center text-sm text-muted-foreground">
              <Inbox className="size-8 text-subtle" />
              {queue.length === 0
                ? "No trucks are waiting for inspection. New tickets appear here automatically."
                : "No tickets match your search."}
            </p>
          )}
        </div>
      </Card>

      <Card className="flex flex-col self-start p-5">
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          Safety Checklist
        </h2>
        {selected && (
          <p className="mt-1 text-xs font-medium text-primary">
            Ticket #{selected.ticket_no} · {selected.truck.plate} ·{" "}
            {TRUCK_TYPE_LABEL[selected.truck.type]}
          </p>
        )}

        {feedback && !rejectOpen && (
          <p
            role={feedback.tone === "error" ? "alert" : "status"}
            className={cn(
              "mt-4 flex gap-2 rounded-xl px-3 py-2.5 text-sm font-medium",
              feedback.tone === "success"
                ? "bg-success-surface text-success"
                : "bg-danger-surface text-danger",
            )}
          >
            {feedback.tone === "success" ? (
              <CircleCheck className="mt-0.5 size-4 shrink-0" />
            ) : (
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            )}
            {feedback.text}
          </p>
        )}

        {selected ? (
          <>
            <div className="mt-5 flex flex-col gap-3">
              {sections.map((section) => {
                const open = openSections.has(section.no);
                return (
                  <div key={section.no} className="rounded-xl border border-border">
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => toggleSection(section.no)}
                      className="flex w-full items-center justify-between gap-2 px-4 py-3"
                    >
                      <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <span className="flex size-6 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-surface">
                          {section.no}
                        </span>
                        {section.title}
                      </span>
                      {open ? (
                        <ChevronUp className="size-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="size-4 text-muted-foreground" />
                      )}
                    </button>
                    {open && (
                      <div className="space-y-3 border-t border-border px-4 py-3">
                        {section.items.map((item) => (
                          <div key={item.key} className="flex items-center justify-between gap-2">
                            <span className="text-sm text-muted-foreground">{item.label}</span>
                            {item.input === "count" ? (
                              <div
                                role="radiogroup"
                                aria-label={item.label}
                                className="inline-flex overflow-hidden rounded-lg border border-border text-xs"
                              >
                                {Array.from({ length: (item.max ?? 1) + 1 }, (_, n) => {
                                  const chosen = (answers[item.key] ?? 0) === n;
                                  return (
                                    <button
                                      key={n}
                                      type="button"
                                      role="radio"
                                      aria-checked={chosen}
                                      onClick={() => setAnswers((current) => ({ ...current, [item.key]: n }))}
                                      className={cn(
                                        "px-2.5 py-1 transition-colors",
                                        chosen
                                          ? "bg-foreground text-surface"
                                          : "text-muted-foreground hover:bg-muted",
                                      )}
                                    >
                                      {n}
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <Switch
                                checked={answers[item.key] === true}
                                label={item.label}
                                onClick={() =>
                                  setAnswers((current) => ({ ...current, [item.key]: current[item.key] !== true }))
                                }
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 space-y-3">
              {!everyItemChecked && (
                <p className="text-xs text-muted-foreground">
                  Check every item to approve. If anything fails, reject the truck.
                </p>
              )}
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    setFeedback(null);
                    setRejectOpen(true);
                  }}
                  className="text-sm font-semibold text-danger transition-colors hover:underline disabled:opacity-50"
                >
                  Reject Ticket
                </button>
                <Button
                  onClick={() => decide({ result: "approved" })}
                  disabled={!everyItemChecked || pending}
                >
                  {pending && !rejectOpen ? "Approving…" : "Approve Ticket"}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <p className="mt-6 flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
            <CircleCheck className="size-8 text-subtle" />
            The queue is clear.
          </p>
        )}
      </Card>

      <Dialog
        open={rejectOpen}
        onClose={() => {
          if (!pending) setRejectOpen(false);
        }}
        title="Confirm Ticket Rejection"
        className="max-w-sm"
        description={
          <>
            You are rejecting truck{" "}
            <span className="font-semibold text-foreground">{selected?.truck.plate}</span>. Choose
            why it failed inspection.
          </>
        }
      >
        <form onSubmit={reject} className="space-y-3">
          <select
            aria-label="Reason for failure"
            required
            className={selectClass}
            value={reason}
            onChange={(event) => setReason(event.target.value as RejectionReason)}
          >
            <option value="" disabled>
              Select a reason
            </option>
            {Object.entries(REJECTION_REASON_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <textarea
            aria-label="Failure details"
            placeholder="Type additional failure details here"
            rows={3}
            maxLength={500}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="w-full rounded-xl border border-input bg-surface p-3 text-sm text-foreground placeholder:text-subtle focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          />
          {feedback?.tone === "error" && (
            <p role="alert" className="text-sm text-danger">
              {feedback.text}
            </p>
          )}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setRejectOpen(false)}
              disabled={pending}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Cancel
            </button>
            <Button type="submit" variant="destructive" size="sm" disabled={!reason || pending}>
              {pending ? "Rejecting…" : "Reject Ticket"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
