import type { Metadata } from "next";
import { LifeBuoy } from "lucide-react";
import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const metadata: Metadata = { title: "Support" };

export default function SafetySupportPage() {
  return (
    <PagePlaceholder
      title="Support"
      icon={LifeBuoy}
      description="Reach the operations team and review safety procedures."
    />
  );
}
