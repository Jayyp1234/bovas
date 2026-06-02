import type { Metadata } from "next";
import { LoadingProgramForm } from "@/features/dashboard/components/loading-program-form";

export const metadata: Metadata = { title: "Generate Ticket" };

export default function GenerateTicketPage() {
  return <LoadingProgramForm />;
}
