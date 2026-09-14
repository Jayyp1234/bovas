import type { Metadata } from "next";
import { SettingsPage } from "@/components/layout/settings-page";
import { AccountSettings } from "@/features/account/components/account-settings";
import { requireRole } from "@/lib/auth/current-user";

export const metadata: Metadata = { title: "Settings" };

export default async function LogisticsSettingsPage() {
  const user = await requireRole("logistics");

  return (
    <SettingsPage>
      <AccountSettings user={user} />
    </SettingsPage>
  );
}
