"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Ticket,
  Clock,
  Droplet,
  ChevronUp,
  ChevronDown,
  TriangleAlert,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  queueTickets,
  checklistSections,
  rejectionReasons,
} from "../data/safety";

const TABS = [
  { id: "all", label: "All" },
  { id: "internal", label: "Internal" },
  { id: "marketer", label: "Marketer" },
  { id: "industrial", label: "Industrial" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const selectClass =
  "flex h-11 w-full rounded-xl border border-input bg-surface px-3.5 text-sm text-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";

function Switch({ checked, onClick }: { checked: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onClick}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
        checked ? "bg-foreground" : "bg-zinc-300",
      )}
    >
      <span
        className={cn(
          "inline-block size-4 transform rounded-full bg-white transition-transform",
          checked ? "translate-x-[18px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

export function TicketsQueue() {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(queueTickets[0]?.id);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [spareTyre, setSpareTyre] = useState(0);
  const [openSections, setOpenSections] = useState<Set<number>>(
    () => new Set(checklistSections.map((s) => s.no)),
  );
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");

  const rows = queueTickets.filter((ticket) => {
    if (tab !== "all" && ticket.truckType.toLowerCase() !== tab) return false;
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return (
      ticket.id.includes(q) ||
      ticket.truckNumber.toLowerCase().includes(q) ||
      ticket.driver.toLowerCase().includes(q)
    );
  });

  const selected =
    queueTickets.find((ticket) => ticket.id === selectedId) ?? queueTickets[0];

  function toggleItem(key: string) {
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleSection(no: number) {
    setOpenSections((current) => {
      const next = new Set(current);
      if (next.has(no)) next.delete(no);
      else next.add(no);
      return next;
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <Card className="flex flex-col overflow-hidden">
        <div className="flex items-center gap-2 p-5">
          <h1 className="text-lg font-bold tracking-tight text-foreground">
            Loading Tickets Queue
          </h1>
          <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
            35
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
          {TABS.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(item.id)}
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
            const isSelected = ticket.id === selected?.id;
            return (
              <button
                key={ticket.id}
                type="button"
                onClick={() => setSelectedId(ticket.id)}
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
                    Ticket #{ticket.id}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3.5" />
                    {ticket.waitMins} mins
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2 text-sm text-muted-foreground">
                  <span>
                    {ticket.truckNumber} · {ticket.truckType}
                  </span>
                  <span className="flex items-center gap-1">
                    <Droplet className="size-3.5" />
                    {ticket.product} - {ticket.quantity}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {ticket.driver}
                </p>
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="flex flex-col self-start p-5">
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          Safety Checklist
        </h2>
        <p className="mt-1 text-xs font-medium text-primary">
          {selected?.truckNumber} · {selected?.truckType}
        </p>

        <div className="mt-5 flex flex-col gap-3">
          {checklistSections.map((section) => {
            const open = openSections.has(section.no);
            return (
              <div key={section.no} className="rounded-xl border border-border">
                <button
                  type="button"
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
                    {section.items.map((item) => {
                      const key = `${section.no}:${item}`;
                      return (
                        <div
                          key={key}
                          className="flex items-center justify-between gap-2"
                        >
                          <span className="text-sm text-muted-foreground">
                            {item}
                          </span>
                          {item === "Spare Tyre" ? (
                            <div className="inline-flex overflow-hidden rounded-lg border border-border text-xs">
                              {[0, 1, 2].map((n) => (
                                <button
                                  key={n}
                                  type="button"
                                  onClick={() => setSpareTyre(n)}
                                  className={cn(
                                    "px-2.5 py-1 transition-colors",
                                    spareTyre === n
                                      ? "bg-foreground text-surface"
                                      : "text-muted-foreground hover:bg-muted",
                                  )}
                                >
                                  {n}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <Switch
                              checked={checked.has(key)}
                              onClick={() => toggleItem(key)}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setRejectOpen(true)}
            className="text-sm font-semibold text-danger transition-colors hover:underline"
          >
            Reject Ticket
          </button>
          <Button onClick={() => router.push("/safety/history")}>
            Approve Ticket
          </Button>
        </div>
      </Card>

      {rejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-xl">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-warning-surface">
              <TriangleAlert className="size-6 text-warning" />
            </div>
            <h2 className="text-center text-base font-bold text-foreground">
              Confirm Ticket Rejection
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              You are rejecting truck {selected?.truckNumber}. Please select
              reason for failure below:
            </p>
            <div className="mt-4 space-y-3">
              <select
                className={selectClass}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              >
                <option value="" disabled>
                  Select
                </option>
                {rejectionReasons.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <textarea
                placeholder="Type additional failure details here"
                rows={3}
                className="w-full rounded-xl border border-input bg-surface p-3 text-sm text-foreground placeholder:text-subtle focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              />
            </div>
            <div className="mt-5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setRejectOpen(false)}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Cancel
              </button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setRejectOpen(false);
                  router.push("/safety/history");
                }}
              >
                Reject Ticket
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
