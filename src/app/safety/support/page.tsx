import type { Metadata } from "next";
import { supportFaqs } from "@/config/support";
import { SupportCenter } from "@/features/support/components/support-center";

export const metadata: Metadata = { title: "Support" };

export default function SafetySupportPage() {
  return <SupportCenter faqs={supportFaqs("safety")} />;
}
