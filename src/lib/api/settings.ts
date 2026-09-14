import "server-only";
import { apiRequest, fromApi, isLive } from "./client";
import * as mock from "./mock/settings";
import type { Settings, SettingsPatch } from "./types";

/** The build phase that implements settings (x-phase in openapi.yaml). */
const PHASE = 6;

/** Terminals, products, the safety checklist and the overload tolerance. `GET /api/settings` */
export function getSettings(): Promise<Settings> {
  return fromApi<Settings>(
    PHASE,
    () => apiRequest("/api/settings"),
    () => mock.getSettings(),
  );
}

/** Lists in the patch replace what's there. `PATCH /api/settings` — 422 names the rows to fix. */
export function updateSettings(patch: SettingsPatch): Promise<Settings> {
  return isLive(PHASE)
    ? apiRequest("/api/settings", { method: "PATCH", body: patch })
    : mock.updateSettings(patch);
}
