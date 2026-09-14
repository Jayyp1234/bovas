import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SafetyTicketDetail } from "@/features/safety/components/safety-ticket-detail";
import { getInspection } from "@/lib/api/safety";

export const metadata: Metadata = { title: "Ticket Detail" };

interface SafetyTicketDetailPageProps {
  params: Promise<{ ticketId: string }>;
}

export default async function SafetyTicketDetailPage({
  params,
}: SafetyTicketDetailPageProps) {
  const { ticketId } = await params;
  const inspection = await getInspection(ticketId);

  if (!inspection) {
    notFound();
  }

  return <SafetyTicketDetail inspection={inspection} />;
}
