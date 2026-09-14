import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { TicketPreviewPanel } from "@/features/dashboard/components/ticket-preview-panel";
import { issuedPreview } from "@/features/dashboard/ticket-values";
import { getTicket } from "@/lib/api/tickets";

export const metadata: Metadata = { title: "Loading Ticket" };

interface TicketPreviewPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** The printable letterhead of an issued ticket: `/ticket-preview?ticket=24989001`. */
export default async function TicketPreviewPage({ searchParams }: TicketPreviewPageProps) {
  const { ticket: ticketNo } = await searchParams;
  if (typeof ticketNo !== "string") redirect("/ticket-history");

  const ticket = await getTicket(ticketNo);
  if (!ticket) notFound();

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <TicketPreviewPanel
        ticket={issuedPreview(ticket)}
        officer={{ name: ticket.created_by.name, title: "Logistics Officer" }}
        editHref={ticket.status === "awaiting_safety" ? `/generate-ticket?edit=${ticket.ticket_no}` : undefined}
        cancelHref={`/ticket-history/${ticket.ticket_no}`}
      />
    </div>
  );
}
