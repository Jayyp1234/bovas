import type { Metadata } from "next";
import { TicketsQueue } from "@/features/safety/components/tickets-queue";
import { getSafetyChecklist, getSafetyQueue } from "@/lib/api/safety";

export const metadata: Metadata = { title: "Tickets Queue" };

export default async function TicketsQueuePage() {
  const [queue, checklist] = await Promise.all([getSafetyQueue(), getSafetyChecklist()]);

  return (
    <TicketsQueue queue={queue.data} total={queue.meta.total} checklist={checklist.data} />
  );
}
