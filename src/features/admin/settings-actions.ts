"use server";

import { revalidatePath } from "next/cache";
import { actionFailure, type ActionResult } from "@/lib/action-result";
import { updateSettings } from "@/lib/api/settings";
import type { Settings, SettingsPatch } from "@/lib/api/types";

export type SettingsResult = ActionResult & { settings?: Settings };

/** Saves one section of Admin Settings and returns the settings as saved, with new terminal IDs. */
export async function updateSettingsAction(patch: SettingsPatch): Promise<SettingsResult> {
  try {
    const settings = await updateSettings(patch);
    // Terminals, the checklist and the tolerance show up in every workspace.
    revalidatePath("/", "layout");
    return { ok: true, message: "Settings saved.", settings };
  } catch (error) {
    return actionFailure(error, "We couldn't save the settings. Try again.");
  }
}
