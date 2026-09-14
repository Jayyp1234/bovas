import { ApiError } from "../client";
import type { ChecklistItem, Settings, SettingsPatch, Terminal } from "../types";
import { checklist, replaceChecklist } from "./safety";
import { VALIDATION_MESSAGE } from "./shared";
import { terminals } from "./terminals";

/** Terminals the demo staff, programs and tickets belong to, which can't be removed. */
const TERMINALS_IN_USE = new Set([1, 2]);

let tolerancePercent = 1;

export function overloadTolerancePercent(): number {
  return tolerancePercent;
}

export async function getSettings(): Promise<Settings> {
  return {
    terminals: terminals.map((terminal) => ({ ...terminal })),
    products: ["PMS", "AGO", "DPK"],
    checklist: checklist.map((item) => ({ ...item })),
    overload_tolerance_percent: tolerancePercent,
  };
}

/** Checks a patch the way bovas-api's SettingsService does, then applies it. */
export async function updateSettings(patch: SettingsPatch): Promise<Settings> {
  const errors: Record<string, string[]> = {};
  const tolerance = patch.overload_tolerance_percent;

  if (tolerance !== undefined && !(Number.isFinite(tolerance) && tolerance >= 0 && tolerance <= 10)) {
    errors.overload_tolerance_percent = ["Overload tolerance percent must be between 0 and 10."];
  }

  const names = new Set<string>();
  patch.terminals?.forEach((terminal, index) => {
    const name = terminal.name.trim().toLowerCase();
    if (!name) errors[`terminals.${index}.name`] = ["Name is required."];
    else if (names.has(name)) errors[`terminals.${index}.name`] = ["Two terminals can't have the same name."];
    if (!terminal.address.trim()) errors[`terminals.${index}.address`] = ["Address is required."];
    names.add(name);
  });
  if (patch.terminals) {
    const kept = new Set(patch.terminals.map((terminal) => terminal.id));
    for (const terminal of terminals) {
      if (!kept.has(terminal.id) && TERMINALS_IN_USE.has(terminal.id)) {
        (errors.terminals ??= []).push(`${terminal.name} can't be removed because staff, programs or tickets use it.`);
      }
    }
  }

  const keys = new Set<string>();
  patch.checklist?.forEach((item, index) => {
    if (!item.label.trim()) errors[`checklist.${index}.label`] = ["Label is required."];
    if (keys.has(item.key)) errors[`checklist.${index}.key`] = ["Two checklist items can't have the same key."];
    if (item.input === "count" && !item.max) errors[`checklist.${index}.max`] = ["Max is required for items that are counted."];
    keys.add(item.key);
  });

  if (Object.keys(errors).length > 0) {
    throw new ApiError(422, VALIDATION_MESSAGE, errors);
  }

  if (tolerance !== undefined) {
    tolerancePercent = tolerance;
  }
  if (patch.terminals) {
    let nextId = Math.max(0, ...terminals.map((terminal) => terminal.id)) + 1;
    const updated: Terminal[] = patch.terminals.map((terminal) => ({
      id: terminal.id ?? nextId++,
      name: terminal.name.trim(),
      address: terminal.address.trim(),
    }));
    terminals.splice(0, terminals.length, ...updated);
  }
  if (patch.checklist) {
    replaceChecklist(
      patch.checklist.map(
        (item): ChecklistItem => ({
          key: item.key,
          label: item.label.trim(),
          section_no: item.section_no,
          section_title: item.section_title.trim(),
          input: item.input,
          ...(item.input === "count" && { max: item.max }),
        }),
      ),
    );
  }

  return getSettings();
}
