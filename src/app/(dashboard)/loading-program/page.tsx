import type { Metadata } from "next";
import { LoadingProgramTable } from "@/features/dashboard/components/loading-program-table";

export const metadata: Metadata = { title: "Loading Program" };

export default function LoadingProgramPage() {
  return <LoadingProgramTable />;
}
