import type { Metadata } from "next";
import { HistoryLog } from "@/features/safety/components/history-log";

export const metadata: Metadata = { title: "History Log" };

export default function HistoryPage() {
  return <HistoryLog />;
}
