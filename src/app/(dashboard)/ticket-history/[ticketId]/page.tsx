import type { Metadata } from "next";
import { TicketDetail as TicketDetailComponent } from "@/features/dashboard/components/ticket-detail";
import { getTicketDetailById } from "@/features/dashboard/data/tickets";

export const metadata: Metadata = { title: "Ticket Details" };

interface TicketDetailPageProps {
  params: Promise<{ ticketId: string }>;
}

export default async function TicketDetailPage({ params }: TicketDetailPageProps) {
  const { ticketId } = await params;
  const ticket = getTicketDetailById(ticketId);

  if (!ticket) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <p className="text-sm font-medium text-destructive">
          Ticket not found.
        </p>
      </div>
    );
  }

  return <TicketDetailComponent ticket={ticket} />;
}
