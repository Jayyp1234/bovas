import type { Metadata } from "next";
import { LifeBuoy } from "lucide-react";
import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const metadata: Metadata = { title: "Support" };

export default function SupportPage() {
  return (
    <PagePlaceholder
      title="Support"
      icon={LifeBuoy}
      description="Reach the operations team and find answers to common questions."
    />
  );
}
