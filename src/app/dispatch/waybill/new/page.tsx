import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WaybillForm } from "@/features/dispatch/components/waybill-form";
import { dispatchQueue, getQueueItemById } from "@/features/dispatch/data/waybills";

export const metadata: Metadata = { title: "Generate Waybill" };

export default async function GenerateWaybillPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const ticketId = typeof sp.ticket === "string" ? sp.ticket : undefined;
  const ticket = ticketId ? getQueueItemById(ticketId) : dispatchQueue[0];

  if (!ticket) {
    notFound();
  }

  return <WaybillForm ticket={ticket} />;
}
