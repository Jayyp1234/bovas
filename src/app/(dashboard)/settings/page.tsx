import type { Metadata } from "next";
import { Settings } from "lucide-react";
import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <PagePlaceholder
      title="Settings"
      icon={Settings}
      description="Manage your profile, preferences, and account configuration."
    />
  );
}
