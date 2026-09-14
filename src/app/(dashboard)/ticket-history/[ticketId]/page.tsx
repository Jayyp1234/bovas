import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TicketDetail } from "@/features/dashboard/components/ticket-detail";
import { getTicket } from "@/lib/api/tickets";

export const metadata: Metadata = { title: "Ticket Details" };

/** Set by the ticket form after saving: `?saved=created` or `?saved=updated`. */
const NOTICES: Record<string, string> = {
  created: "Ticket generated. It's now waiting in the Safety queue.",
  updated: "Changes saved.",
};

interface TicketDetailPageProps {
  params: Promise<{ ticketId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function TicketDetailPage({ params, searchParams }: TicketDetailPageProps) {
  const [{ ticketId }, { saved }] = await Promise.all([params, searchParams]);
  const ticket = await getTicket(ticketId);

  if (!ticket) {
    notFound();
  }

  return (
    <TicketDetail ticket={ticket} notice={typeof saved === "string" ? NOTICES[saved] : undefined} />
  );
}
