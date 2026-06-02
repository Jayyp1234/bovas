import type { Metadata } from "next";
import { TicketHistoryTable } from "@/features/dashboard/components/ticket-history-table";

export const metadata: Metadata = { title: "Ticket History" };

export default function TicketHistoryPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <TicketHistoryTable />
    </div>
  );
}
