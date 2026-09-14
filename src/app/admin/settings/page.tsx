import type { Metadata } from "next";
import { SettingsPage } from "@/components/layout/settings-page";
import { ParamTabs } from "@/components/ui/table-controls";
import { AccountSettings } from "@/features/account/components/account-settings";
import { DepotSettings } from "@/features/admin/components/depot-settings";
import { getSettings } from "@/lib/api/settings";
import { requireRole } from "@/lib/auth/current-user";
import { oneOfParam, type SearchParams } from "@/lib/search-params";

export const metadata: Metadata = { title: "Settings" };

const TABS = [
  { key: "depot", label: "Depot" },
  { key: "account", label: "My Account" },
];

export default async function AdminSettingsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const tab = oneOfParam(params, "tab", ["depot", "account"] as const) ?? "depot";
  const user = await requireRole("admin");

  return (
    <SettingsPage tabs={<ParamTabs param="tab" label="Settings section" tabs={TABS} defaultValue="depot" />}>
      {tab === "depot" ? <DepotSettings settings={await getSettings()} /> : <AccountSettings user={user} />}
    </SettingsPage>
  );
}
