import type { Metadata } from "next";
import { TicketsQueue } from "@/features/safety/components/tickets-queue";

export const metadata: Metadata = { title: "Tickets Queue" };

export default function TicketsQueuePage() {
  return <TicketsQueue />;
}
