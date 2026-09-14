import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WaybillDocument } from "@/features/dispatch/components/waybill-document";
import { getWaybill } from "@/lib/api/dispatch";
import type { Role, Waybill } from "@/lib/api/types";
import { requireRole } from "@/lib/auth/current-user";

export const metadata: Metadata = { title: "Waybill" };

/** Who may open a waybill; matches `x-roles` for `GET /api/waybills/{waybill_no}`. */
const ALLOWED: Role[] = ["dispatch", "logistics", "admin"];

/** Where "Back" goes, by the viewer's workspace. */
function backHref(role: Role, waybill: Waybill): string {
  if (role === "logistics") return `/ticket-history/${waybill.ticket_no}`;
  if (role === "admin") return `/admin/audit/${waybill.ticket_no}`;
  return "/dispatch/gate";
}

interface WaybillPageProps {
  params: Promise<{ waybillNo: string }>;
}

export default async function WaybillPage({ params }: WaybillPageProps) {
  const { waybillNo } = await params;
  const user = await requireRole(ALLOWED);
  const waybill = await getWaybill(waybillNo);

  if (!waybill) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <WaybillDocument waybill={waybill} backHref={backHref(user.role ?? "dispatch", waybill)} />
      </div>
    </main>
  );
}
