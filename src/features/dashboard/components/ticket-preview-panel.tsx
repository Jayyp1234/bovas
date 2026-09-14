"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { Globe, Pencil, Phone, Printer } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { COMPANY } from "@/config/company";

export interface TicketDestination {
  station: string;
  quantity: string;
  address: string;
}

export interface TicketPreviewData {
  ticketId: string;
  date: string;
  time: string;
  depot: string;
  truckType: string;
  truckNumber: string;
  product: string;
  requestedAmount: string;
  destinations: TicketDestination[];
  /** Empty for internal trucks. */
  marketer: string;
  representative: string;
  phoneNumber: string;
}

interface TicketPreviewPanelProps {
  ticket: TicketPreviewData;
  /** The Logistics officer who signs the ticket. */
  officer: { name: string; title: string };
  /** Back to the form, for a ticket that isn't saved yet. */
  onEdit?: () => void;
  /** The edit page, for an issued ticket Safety hasn't inspected. */
  editHref?: string;
  cancelHref: string;
  /** Saves a draft. Without it the panel shows an issued ticket, ready to print. */
  onConfirm?: () => void;
  confirmLabel?: string;
  pending?: boolean;
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm leading-relaxed">
      <span className="text-letterhead-muted">{label} </span>
      <span className="font-semibold text-letterhead-ink">{value}</span>
    </p>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-letterhead-muted">{label}</p>
      <p className="text-sm font-bold text-letterhead-ink">{value}</p>
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-tl-xl rounded-br-xl bg-letterhead-label px-4 py-1.5 text-[11px] font-medium tracking-wide text-on-solid">
      {children}
    </span>
  );
}

export function TicketPreviewPanel({
  ticket,
  officer,
  onEdit,
  editHref,
  cancelHref,
  onConfirm,
  confirmLabel = "Create Ticket",
  pending = false,
}: TicketPreviewPanelProps) {
  const draft = onConfirm !== undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 print:hidden">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          {draft ? "Ticket Preview" : `Loading Ticket ${ticket.ticketId}`}
        </h1>
        {onEdit ? (
          <Button variant="secondary" size="sm" onClick={onEdit} disabled={pending}>
            Edit
            <Pencil className="size-4" />
          </Button>
        ) : (
          editHref && (
            <Link href={editHref} className={buttonVariants({ variant: "secondary", size: "sm" })}>
              Edit
              <Pencil className="size-4" />
            </Link>
          )
        )}
      </div>

      <article className="mx-auto max-w-2xl rounded-2xl border border-letterhead-rule bg-linear-160 from-letterhead-paper to-letterhead-paper-shade p-7 shadow-sm sm:p-9">
        <header className="flex items-start justify-between gap-4">
          <h2 className="text-2xl font-extrabold tracking-tight text-letterhead-accent">
            Loading Ticket
          </h2>
          <Logo className="h-7 w-auto" />
        </header>

        <div className="mt-6 flex flex-wrap items-start justify-between gap-y-4">
          <Meta label="Ticket ID:" value={ticket.ticketId} />
          <div className="flex gap-6 sm:gap-8">
            <Meta label="Date:" value={ticket.date} />
            <Meta label="Time:" value={ticket.time} />
            <Meta label="Depot:" value={ticket.depot} />
          </div>
        </div>

        <section className="mt-6">
          <SectionLabel>Truck Information</SectionLabel>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 rounded-xl rounded-tl-none border border-letterhead-rule bg-surface/50 p-5">
            <Detail label="Truck type:" value={ticket.truckType} />
            <Detail label="Product:" value={ticket.product} />
            <Detail label="Truck number:" value={ticket.truckNumber} />
            <Detail label="Quantity requested:" value={ticket.requestedAmount} />
          </div>
        </section>

        <section className="mt-6">
          <SectionLabel>Destination/Distribution</SectionLabel>
          <div className="space-y-5 rounded-xl rounded-tl-none border border-letterhead-rule bg-surface/50 p-5">
            {ticket.destinations.map((destination, index) => (
              <div key={index} className="grid grid-cols-[2.5rem_1fr] gap-2">
                <span className="text-lg font-extrabold text-letterhead-ink">
                  {String(index + 1).padStart(2, "0")}.
                </span>
                <div className="space-y-1.5">
                  <Detail label="Station:" value={destination.station} />
                  <Detail label="Address:" value={destination.address} />
                  <Detail label="Quantity to be discharged:" value={destination.quantity} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {ticket.marketer && (
          <section className="mt-6">
            <SectionLabel>Marketer</SectionLabel>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 rounded-xl rounded-tl-none border border-letterhead-rule bg-surface/50 p-5">
              <Detail label="Marketer:" value={ticket.marketer} />
              <Detail label="Representative:" value={ticket.representative} />
              <Detail label="Phone:" value={ticket.phoneNumber} />
            </div>
          </section>
        )}

        <div className="mt-8 flex justify-end text-right">
          <div>
            <p className="text-sm font-bold text-letterhead-ink">{officer.name}</p>
            <p className="text-xs text-letterhead-muted">{officer.title}</p>
          </div>
        </div>

        <footer className="mt-6 flex flex-col gap-3 border-t border-letterhead-rule pt-4 text-[11px] text-letterhead-muted sm:flex-row sm:justify-between">
          <div className="space-y-0.5">
            {COMPANY.addresses.map((address) => (
              <p key={address}>{address}</p>
            ))}
          </div>
          <div className="space-y-1">
            <p className="flex items-center gap-1.5">
              <Globe className="size-3.5 text-letterhead-accent" />
              {COMPANY.website}
            </p>
            <p className="flex items-center gap-1.5">
              <Phone className="size-3.5 text-letterhead-accent" />
              {COMPANY.phones}
            </p>
          </div>
        </footer>
      </article>

      <div className="flex justify-end gap-3 print:hidden">
        <Link
          href={cancelHref}
          aria-disabled={pending}
          className={buttonVariants({ variant: "secondary" })}
        >
          {draft ? "Cancel" : "Back"}
        </Link>
        {draft ? (
          <Button onClick={onConfirm} disabled={pending}>
            {pending ? "Saving…" : confirmLabel}
          </Button>
        ) : (
          <Button onClick={() => window.print()}>
            <Printer className="size-4" />
            Print Ticket
          </Button>
        )}
      </div>
    </div>
  );
}
