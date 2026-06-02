import type { Metadata } from "next";
import { TicketPreviewPanel } from "@/features/dashboard/components/ticket-preview-panel";

export const metadata: Metadata = { title: "Ticket Preview" };

const ticketPreviewData = {
  ticketId: "1234567",
  date: "Mon. 21st April, 2026",
  time: "14:10",
  depot: "Terminal 1",
  truckType: "Internal",
  truckNumber: "BDJ580XB",
  product: "PMS",
  requestedAmount: "33,000 Litres",
  destinations: [
    {
      station: "Akobo 4",
      quantity: "22,000 Litres",
      address: "Km 45, Lagos-Badagry Expressway, Satellite Town, Ojo Navy Barracks, Lagos state.",
    },
    {
      station: "Akobo 2",
      quantity: "11,000 Litres",
      address: "Km 45, Lagos-Badagry Expressway, Satellite Town, Ojo Navy Barracks, Lagos state.",
    },
  ],
  marketer: "Feasible Path LTD",
  representative: "Opeyemi Fadenipo",
  phoneNumber: "08104205202",
};

export default function TicketPreviewPage() {
  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <TicketPreviewPanel ticket={ticketPreviewData} editHref="/generate-ticket" />
    </div>
  );
}
