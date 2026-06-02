import type { Metadata } from "next";
import { MarketerRecords } from "@/features/admin/components/marketer-records";

export const metadata: Metadata = { title: "Marketer's Records" };

export default function MarketerRecordsPage() {
  return <MarketerRecords />;
}
