/**
 * When a load counts as overloaded, mirrored from bovas-api Domain/OverloadRule so Dispatch sees
 * the outcome before recording it. The API makes the real decision. Safe for client components.
 */
import type { LoadingOutcome } from "@/lib/api/types";

/**
 * The most a truck may load against a request before it's overloaded: 45,000 at 1% → 45,450.
 * The tolerance is an admin setting (`Settings.overload_tolerance_percent`), counted to 0.01%.
 */
export function overloadAllowance(requestedLitres: number, tolerancePercent: number): number {
  return Math.floor((requestedLitres * (10000 + Math.round(tolerancePercent * 100))) / 10000);
}

/** `capacityLitres` is 0 for trucks that aren't registered, which skips the capacity check. */
export function loadingOutcome(
  actualLitres: number,
  requestedLitres: number,
  capacityLitres: number,
  tolerancePercent: number,
): LoadingOutcome {
  const overCapacity = capacityLitres > 0 && actualLitres > capacityLitres;
  return overCapacity || actualLitres > overloadAllowance(requestedLitres, tolerancePercent)
    ? "overloaded"
    : "within_limit";
}
