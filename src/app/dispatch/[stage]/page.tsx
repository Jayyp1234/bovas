import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DispatchQueue } from "@/features/dispatch/components/dispatch-queue";
import { getDispatchQueue } from "@/lib/api/dispatch";
import type { DispatchStage } from "@/lib/api/types";

/** URL segment → the queue it shows and its page title. */
const STAGES: Record<string, { stage: DispatchStage; title: string }> = {
  loading: { stage: "loading", title: "Loading Queue" },
  waybills: { stage: "waybill", title: "Waybills" },
  gate: { stage: "gate", title: "Gate" },
};

interface DispatchStagePageProps {
  params: Promise<{ stage: string }>;
}

export async function generateMetadata({ params }: DispatchStagePageProps): Promise<Metadata> {
  const { stage } = await params;
  return { title: STAGES[stage]?.title ?? "Dispatch" };
}

export default async function DispatchStagePage({ params }: DispatchStagePageProps) {
  const { stage: segment } = await params;
  const page = STAGES[segment];
  if (!page) notFound();

  const queue = await getDispatchQueue(page.stage);

  return (
    <DispatchQueue
      key={page.stage}
      stage={page.stage}
      items={queue.data}
      tolerancePercent={queue.meta.overload_tolerance_percent}
    />
  );
}
