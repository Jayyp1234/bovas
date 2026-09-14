import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { TicketForm } from "@/features/dashboard/components/ticket-form";
import {
  emptyValues,
  valuesFromProgramItem,
  valuesFromTicket,
} from "@/features/dashboard/ticket-values";
import { listCustomers } from "@/lib/api/customers";
import { listProgramItems } from "@/lib/api/programs";
import { listTerminals } from "@/lib/api/terminals";
import { getTicket } from "@/lib/api/tickets";
import { requireRole } from "@/lib/auth/current-user";
import { formatDepotDate, formatDepotTime } from "@/lib/format";

export const metadata: Metadata = { title: "Generate Ticket" };

interface GenerateTicketPageProps {
  /** `?item=<program row id>` starts from the loading program; `?edit=<ticket no>` edits a ticket. */
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function GenerateTicketPage({ searchParams }: GenerateTicketPageProps) {
  const { item, edit } = await searchParams;
  const editNo = typeof edit === "string" ? edit : undefined;
  const itemId = typeof item === "string" ? Number(item) : undefined;

  const [user, terminals, customers, ticket, program] = await Promise.all([
    requireRole("logistics"),
    listTerminals(),
    listCustomers({ per_page: 100 }),
    editNo ? getTicket(editNo) : null,
    itemId ? listProgramItems({ per_page: 100 }) : null,
  ]);

  if (editNo) {
    if (!ticket) notFound();
    // Safety has already decided, so the ticket can only be viewed.
    if (ticket.status !== "awaiting_safety") redirect(`/ticket-history/${editNo}`);
  }

  const programItem = program?.data.find((row) => row.id === itemId);
  if (programItem?.ticket_no) redirect(`/ticket-history/${programItem.ticket_no}`);

  const initial = ticket
    ? valuesFromTicket(ticket)
    : programItem
      ? valuesFromProgramItem(programItem, customers.data, user.terminal.id)
      : emptyValues(user.terminal.id);
  const now = new Date().toISOString();

  return (
    <TicketForm
      key={editNo ?? itemId ?? "new"}
      ticketNo={ticket?.ticket_no}
      programItemId={programItem?.id}
      initial={initial}
      terminals={terminals.data}
      customers={customers.data}
      officer={{ name: user.name, title: user.role_title }}
      issuedAt={{ date: formatDepotDate(now), time: formatDepotTime(now) }}
    />
  );
}
