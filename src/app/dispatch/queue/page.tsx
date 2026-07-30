import type { Metadata } from "next";
import { DispatchQueue } from "@/features/dispatch/components/dispatch-queue";

export const metadata: Metadata = { title: "Dispatch Queue" };

export default function DispatchQueuePage() {
  return <DispatchQueue />;
}
