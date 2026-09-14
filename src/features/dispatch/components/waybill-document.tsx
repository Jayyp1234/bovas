"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { Globe, Phone, Printer } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { COMPANY } from "@/config/company";
import { TRUCK_TYPE_LABEL } from "@/domain/labels";
import { formatDepotDate, formatDepotTime, formatLitres } from "@/lib/format";
import type { Waybill } from "@/lib/api/types";

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

function Signature({ label, name }: { label: string; name?: string }) {
  return (
    <div className="flex-1">
      <div className="h-8 border-b border-letterhead-rule text-sm font-semibold text-letterhead-ink">{name}</div>
      <p className="mt-1 text-[11px] text-letterhead-muted">{label}</p>
    </div>
  );
}

interface WaybillDocumentProps {
  waybill: Waybill;
  /** Where "Back" goes for the person viewing it. */
  backHref: string;
}

/** The waybill on the company letterhead, styled like the loading ticket and ready to print. */
export function WaybillDocument({ waybill, backHref }: WaybillDocumentProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 print:hidden">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Waybill {waybill.waybill_no}</h1>
        <div className="flex gap-3">
          <Link href={backHref} className={buttonVariants({ variant: "secondary", size: "sm" })}>
            Back
          </Link>
          <Button size="sm" onClick={() => window.print()}>
            <Printer className="size-4" />
            Print
          </Button>
        </div>
      </div>

      <article className="mx-auto max-w-2xl rounded-2xl border border-letterhead-rule bg-linear-160 from-letterhead-paper to-letterhead-paper-shade p-7 shadow-sm sm:p-9">
        <header className="flex items-start justify-between gap-4">
          <h2 className="text-2xl font-extrabold tracking-tight text-letterhead-accent">Waybill</h2>
          <Logo className="h-7 w-auto" />
        </header>

        <div className="mt-6 flex flex-wrap items-start justify-between gap-y-4">
          <div className="flex gap-6 sm:gap-8">
            <Meta label="Waybill No:" value={waybill.waybill_no} />
            <Meta label="Loading Ticket:" value={waybill.ticket_no} />
          </div>
          <div className="flex gap-6 sm:gap-8">
            <Meta label="Date:" value={formatDepotDate(waybill.issued_at)} />
            <Meta label="Time:" value={formatDepotTime(waybill.issued_at)} />
            <Meta label="Depot:" value={waybill.terminal.name} />
          </div>
        </div>

        <section className="mt-6">
          <SectionLabel>Customer &amp; Truck</SectionLabel>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 rounded-xl rounded-tl-none border border-letterhead-rule bg-surface/50 p-5">
            <Detail label="Customer:" value={waybill.customer.name} />
            <Detail label="Truck type:" value={TRUCK_TYPE_LABEL[waybill.truck.type]} />
            <Detail label="Truck number:" value={waybill.truck.plate} />
            <Detail
              label="Capacity:"
              value={waybill.truck.capacity_litres > 0 ? formatLitres(waybill.truck.capacity_litres) : "Not registered"}
            />
            <Detail label="Driver:" value={waybill.driver?.name ?? "Not recorded"} />
            <Detail label="Driver's phone:" value={waybill.driver?.phone ?? "Not recorded"} />
          </div>
        </section>

        <section className="mt-6">
          <SectionLabel>Product Loaded</SectionLabel>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 rounded-xl rounded-tl-none border border-letterhead-rule bg-surface/50 p-5">
            <Detail label="Product:" value={waybill.product} />
            <Detail label="Quantity loaded:" value={formatLitres(waybill.actual_litres)} />
          </div>
        </section>

        <section className="mt-6">
          <SectionLabel>Destination/Distribution</SectionLabel>
          <div className="space-y-5 rounded-xl rounded-tl-none border border-letterhead-rule bg-surface/50 p-5">
            {waybill.destinations.map((destination, index) => (
              <div key={index} className="grid grid-cols-[2.5rem_1fr] gap-2">
                <span className="text-lg font-extrabold text-letterhead-ink">
                  {String(index + 1).padStart(2, "0")}.
                </span>
                <div className="space-y-1.5">
                  <Detail label="Station:" value={destination.station} />
                  <Detail label="Address:" value={destination.address} />
                  <Detail label="Quantity to be discharged:" value={formatLitres(destination.litres)} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-10 flex gap-8">
          <Signature label="Dispatched by" name={waybill.dispatcher.name} />
          <Signature label="Driver's signature" />
          <Signature label="Received by" />
        </div>

        <footer className="mt-8 flex flex-col gap-3 border-t border-letterhead-rule pt-4 text-[11px] text-letterhead-muted sm:flex-row sm:justify-between">
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
    </div>
  );
}
