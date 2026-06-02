import Link from "next/link";
import { Edit3, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "./status-badge";
import type { TicketDetail } from "@/features/dashboard/data/tickets";

interface TicketDetailProps {
  ticket: TicketDetail;
}

export function TicketDetail({ ticket }: TicketDetailProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/ticket-history"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            Back
          </Link>
        </div>
        {ticket.status === "pending" ? (
          <Button variant="outline" size="sm">
            <Edit3 className="size-4" />
            Edit
          </Button>
        ) : null}
      </div>

      <div className="rounded-[2rem] border border-border bg-surface p-6 shadow-sm">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-foreground">
              Ticket {ticket.id} | {ticket.terminal}
            </h1>
            <StatusBadge status={ticket.status} />
          </div>
        </div>

        <Card className="rounded-[1.5rem] border-border bg-surface/80 shadow-none">
          <CardHeader>
            <CardTitle>Truck Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-3xl border border-border bg-white px-4 py-4">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Truck Type
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {ticket.truckType}
              </p>
            </div>
            <div className="rounded-3xl border border-border bg-white px-4 py-4">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Truck Number
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {ticket.truckNumber}
              </p>
            </div>
            <div className="rounded-3xl border border-border bg-white px-4 py-4">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Product
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {ticket.product}
              </p>
            </div>
            <div className="rounded-3xl border border-border bg-white px-4 py-4">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Requested Loading Amount
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {ticket.requestedAmount}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[1.5rem] border-border bg-surface/80 shadow-none">
          <CardHeader>
            <CardTitle>Destination / Distribution Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {ticket.destinations.map((destination, index) => (
              <div key={index} className="rounded-3xl border border-border bg-white p-5">
                <div className="flex items-start gap-4">
                  {ticket.destinations.length > 1 ? (
                    <div className="text-2xl font-semibold text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                  ) : null}
                  <div className="flex-1 space-y-3">
                    <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                          Station
                        </p>
                        <p className="mt-2 text-sm font-semibold text-foreground">
                          {destination.station}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                          Amount to be Discharged
                        </p>
                        <p className="mt-2 text-sm font-semibold text-foreground">
                          {destination.amount}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                        Address
                      </p>
                      <p className="mt-2 text-sm font-semibold text-foreground">
                        {destination.address}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[1.5rem] border-border bg-surface/80 shadow-none">
          <CardHeader>
            <CardTitle>Marketer&apos;s Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-border bg-white px-4 py-4">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Marketer
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {ticket.marketerInfo.marketer}
              </p>
            </div>
            <div className="rounded-3xl border border-border bg-white px-4 py-4">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Name
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {ticket.marketerInfo.representative}
              </p>
            </div>
            <div className="rounded-3xl border border-border bg-white px-4 py-4">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Phone Number
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {ticket.marketerInfo.phone}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
