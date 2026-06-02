import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SafetyTicketDetail } from "@/features/safety/components/safety-ticket-detail";
import { getSafetyRecordById } from "@/features/safety/data/safety";

export const metadata: Metadata = { title: "Ticket Detail" };

interface SafetyTicketDetailPageProps {
  params: Promise<{ ticketId: string }>;
}

export default async function SafetyTicketDetailPage({
  params,
}: SafetyTicketDetailPageProps) {
  const { ticketId } = await params;
  const record = getSafetyRecordById(ticketId);

  if (!record) {
    notFound();
  }

  return <SafetyTicketDetail record={record} />;
}
