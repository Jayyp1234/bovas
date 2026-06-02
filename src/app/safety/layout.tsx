import type { ReactNode } from "react";
import { SafetyShell } from "@/features/safety/components/safety-shell";

export default function SafetyLayout({ children }: { children: ReactNode }) {
  return <SafetyShell>{children}</SafetyShell>;
}
