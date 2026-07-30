import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WaybillActivity } from "@/features/dispatch/components/waybill-activity";
import { getWaybillById } from "@/features/dispatch/data/waybills";

export const metadata: Metadata = { title: "Waybill Activity" };

interface WaybillActivityPageProps {
  params: Promise<{ waybillId: string }>;
}

export default async function WaybillActivityPage({
  params,
}: WaybillActivityPageProps) {
  const { waybillId } = await params;
  const waybill = getWaybillById(waybillId);

  if (!waybill) {
    notFound();
  }

  return <WaybillActivity waybill={waybill} />;
}
