import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuditDetail } from "@/features/admin/components/audit-detail";
import { getAuditRecordById } from "@/features/admin/data/audit";

export const metadata: Metadata = { title: "Audit Detail" };

interface AuditDetailPageProps {
  params: Promise<{ auditId: string }>;
}

export default async function AuditDetailPage({ params }: AuditDetailPageProps) {
  const { auditId } = await params;
  const record = getAuditRecordById(auditId);

  if (!record) {
    notFound();
  }

  return <AuditDetail record={record} />;
}
