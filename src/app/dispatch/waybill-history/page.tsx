import type { Metadata } from "next";
import { WaybillHistoryTable } from "@/features/dispatch/components/waybill-history-table";

export const metadata: Metadata = { title: "Waybill History" };

export default function WaybillHistoryPage() {
  return <WaybillHistoryTable />;
}
