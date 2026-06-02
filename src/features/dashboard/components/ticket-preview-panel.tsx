"use client";

import { type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Globe, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

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
  marketer: string;
  representative: string;
  phoneNumber: string;
}

interface TicketPreviewPanelProps {
  ticket: TicketPreviewData;
  onEdit?: () => void;
  editHref?: string;
  onCancel?: () => void;
  onCreate?: () => void;
}

/** Static company letterhead details printed on every ticket. */
const COMPANY = {
  addresses: [
    "Head Office, 240 Kofo Abayomi Street, Victoria Island, Lagos",
    "Terminal 1: Ibeshe Estate, Ibru Jetty, Apapa, Lagos",
    "Terminal 2: Mosheshe Estate, Kirikiri Phase I, Apapa, Lagos",
  ],
  website: "www.bovasgroup.com",
  phones: "08104205202, 09104205202",
  officer: { name: "Olateju Oyetoke", title: "Logistics Officer" },
};

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm leading-relaxed">
      <span className="text-[#9a9382]">{label} </span>
      <span className="font-semibold text-[#2b2b2b]">{value}</span>
    </p>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-[#9a9382]">{label}</p>
      <p className="text-sm font-bold text-[#2b2b2b]">{value}</p>
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-tl-xl rounded-br-xl bg-[#8a7d6a] px-4 py-1.5 text-[11px] font-medium tracking-wide text-white">
      {children}
    </span>
  );
}

export function TicketPreviewPanel({
  ticket,
  onEdit,
  editHref,
  onCancel,
  onCreate,
}: TicketPreviewPanelProps) {
  const router = useRouter();

  const handleEdit = onEdit ?? (() => router.push(editHref ?? "/generate-ticket"));
  const handleCancel = onCancel ?? (() => router.push("/dashboard"));
  const handleCreate = onCreate ?? (() => router.push("/ticket-history"));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Ticket Preview
        </h1>
        <Button variant="secondary" size="sm" onClick={handleEdit}>
          Edit
          <Pencil className="size-4" />
        </Button>
      </div>

      <article
        className="mx-auto max-w-2xl rounded-2xl border border-[#efe6d4] p-7 shadow-sm sm:p-9"
        style={{ background: "linear-gradient(160deg,#fefbf4 0%,#fdf5e7 100%)" }}
      >
        <header className="flex items-start justify-between gap-4">
          <h2 className="text-2xl font-extrabold tracking-tight text-[#e3a72b]">
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
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 rounded-xl rounded-tl-none border border-[#efe6d4] bg-white/50 p-5">
            <Detail label="Truck type:" value={ticket.truckType} />
            <Detail label="Product:" value={ticket.product} />
            <Detail label="Truck number:" value={ticket.truckNumber} />
            <Detail label="Quantity requested:" value={ticket.requestedAmount} />
          </div>
        </section>

        <section className="mt-6">
          <SectionLabel>Destination/Distribution</SectionLabel>
          <div className="space-y-5 rounded-xl rounded-tl-none border border-[#efe6d4] bg-white/50 p-5">
            {ticket.destinations.map((destination, index) => (
              <div key={index} className="grid grid-cols-[2.5rem_1fr] gap-2">
                <span className="text-lg font-extrabold text-[#2b2b2b]">
                  {String(index + 1).padStart(2, "0")}.
                </span>
                <div className="space-y-1.5">
                  <Detail label="Station:" value={destination.station} />
                  <Detail label="Address:" value={destination.address} />
                  <Detail
                    label="Quantity to be discharged:"
                    value={destination.quantity}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8 flex justify-end text-right">
          <div>
            <p className="text-sm font-bold text-[#2b2b2b]">
              {COMPANY.officer.name}
            </p>
            <p className="text-xs text-[#9a9382]">{COMPANY.officer.title}</p>
          </div>
        </div>

        <footer className="mt-6 flex flex-col gap-3 border-t border-[#efe6d4] pt-4 text-[11px] text-[#9a9382] sm:flex-row sm:justify-between">
          <div className="space-y-0.5">
            {COMPANY.addresses.map((address) => (
              <p key={address}>{address}</p>
            ))}
          </div>
          <div className="space-y-1">
            <p className="flex items-center gap-1.5">
              <Globe className="size-3.5 text-[#e3a72b]" />
              {COMPANY.website}
            </p>
            <p className="flex items-center gap-1.5">
              <Phone className="size-3.5 text-[#e3a72b]" />
              {COMPANY.phones}
            </p>
          </div>
        </footer>
      </article>

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleCreate}>Create Ticket</Button>
      </div>
    </div>
  );
}
