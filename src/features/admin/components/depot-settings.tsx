"use client";

import { useState, useTransition, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import { overloadAllowance } from "@/domain/overload";
import type { ChecklistItem, Product, Settings, SettingsPatch, Terminal } from "@/lib/api/types";
import { updateSettingsAction } from "../settings-actions";

const PRODUCT_NAME: Record<Product, string> = {
  PMS: "Premium Motor Spirit (petrol)",
  AGO: "Automotive Gas Oil (diesel)",
  DPK: "Dual Purpose Kerosene",
};

const selectClass =
  "h-10 rounded-lg border border-input bg-surface px-2.5 text-sm text-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";

const iconButton =
  "inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30";

let rowCounter = 0;
/** A stable React key for rows that don't have an ID yet. */
function rowKey(): string {
  return `row-${++rowCounter}`;
}

/** Saves one section; field errors come back keyed like `terminals.2.name`. */
function useSectionSave(onSaved: (settings: Settings) => void) {
  const toast = useToast();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState<string>();
  const [pending, startTransition] = useTransition();

  function save(patch: SettingsPatch) {
    startTransition(async () => {
      const result = await updateSettingsAction(patch);
      if (result.ok) {
        toast(result.message);
        setErrors({});
        setMessage(undefined);
        if (result.settings) onSaved(result.settings);
        return;
      }
      setErrors(result.fieldErrors);
      setMessage(result.message);
    });
  }

  return { save, errors, message, pending, error: (key: string) => errors[key]?.[0] };
}

function Section({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="p-5 sm:p-6">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        <div className="mt-5">{children}</div>
      </div>
      {footer && (
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border bg-muted/30 px-5 py-3 sm:px-6">
          {footer}
        </div>
      )}
    </Card>
  );
}

function Alert({ messages }: { messages: (string | undefined)[] }) {
  const shown = messages.filter(Boolean);
  return shown.length > 0 ? (
    <div role="alert" className="mb-4 space-y-1 rounded-xl bg-danger-surface px-3 py-2.5 text-sm font-medium text-danger">
      {shown.map((message) => (
        <p key={message}>{message}</p>
      ))}
    </div>
  ) : null;
}

function ToleranceSection({ value, onSaved }: { value: number; onSaved: (settings: Settings) => void }) {
  const [draft, setDraft] = useState(String(value));
  const { save, message, pending, error } = useSectionSave(onSaved);
  const parsed = Number(draft);
  const valid = draft.trim() !== "" && Number.isFinite(parsed) && parsed >= 0 && parsed <= 10;
  const fieldError = error("overload_tolerance_percent") ?? (valid ? undefined : "Enter a number from 0 to 10.");

  return (
    <Section
      title="Overload Tolerance"
      description="How far above the requested litres a truck may load before an admin has to approve it. Loads over the truck's capacity always need approval."
      footer={
        <Button onClick={() => save({ overload_tolerance_percent: parsed })} disabled={pending || !valid || parsed === value}>
          {pending ? "Saving…" : "Save Tolerance"}
        </Button>
      }
    >
      <Alert messages={[message]} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="overload-tolerance">Tolerance (%)</Label>
          <Input
            id="overload-tolerance"
            type="number"
            inputMode="decimal"
            min={0}
            max={10}
            step={0.1}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            aria-invalid={fieldError ? true : undefined}
            aria-describedby="overload-tolerance-error overload-tolerance-example"
            className="h-11 w-36 rounded-xl"
          />
        </div>
        <p id="overload-tolerance-example" className="text-sm text-muted-foreground sm:pb-3">
          {valid
            ? `At ${parsed}%, a 45,000-litre request may load up to ${formatNumber(overloadAllowance(45000, parsed))} litres.`
            : " "}
        </p>
      </div>
      <FieldError id="overload-tolerance-error" message={fieldError} />
    </Section>
  );
}

interface TerminalRow extends Omit<Terminal, "id"> {
  id: number | null;
  rowKey: string;
}

function TerminalsSection({ terminals, onSaved }: { terminals: Terminal[]; onSaved: (settings: Settings) => void }) {
  const [rows, setRows] = useState<TerminalRow[]>(() => terminals.map((terminal) => ({ ...terminal, rowKey: rowKey() })));
  const { save, errors, message, pending, error } = useSectionSave(onSaved);

  const update = (index: number, field: "name" | "address", value: string) =>
    setRows((current) => current.map((row, i) => (i === index ? { ...row, [field]: value } : row)));

  return (
    <Section
      title="Terminals"
      description="Depots that load trucks. Staff, tickets and letterheads use these names and addresses."
      footer={
        <>
          <Button
            variant="secondary"
            onClick={() => setRows((current) => [...current, { id: null, name: "", address: "", rowKey: rowKey() }])}
            disabled={pending}
          >
            <Plus className="size-4" aria-hidden />
            Add Terminal
          </Button>
          <Button
            onClick={() => save({ terminals: rows.map(({ id, name, address }) => ({ id, name, address })) })}
            disabled={pending || rows.length === 0}
          >
            {pending ? "Saving…" : "Save Terminals"}
          </Button>
        </>
      }
    >
      <Alert messages={[...(errors.terminals ?? []), errors.terminals ? undefined : message]} />
      <ul className="space-y-3">
        {rows.map((row, index) => {
          const nameId = `terminal-${row.rowKey}-name`;
          const addressId = `terminal-${row.rowKey}-address`;
          const nameError = error(`terminals.${index}.name`) ?? error(`terminals.${index}.id`);
          const addressError = error(`terminals.${index}.address`);
          return (
            <li key={row.rowKey} className="grid gap-3 rounded-xl border border-border p-3 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_auto] sm:items-start">
              <div className="space-y-1.5">
                <Label htmlFor={nameId} className="text-xs">Name</Label>
                <Input
                  id={nameId}
                  value={row.name}
                  maxLength={60}
                  onChange={(event) => update(index, "name", event.target.value)}
                  aria-invalid={nameError ? true : undefined}
                  aria-describedby={nameError ? `${nameId}-error` : undefined}
                  className="h-10 rounded-lg"
                />
                <FieldError id={`${nameId}-error`} message={nameError} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={addressId} className="text-xs">Address</Label>
                <Input
                  id={addressId}
                  value={row.address}
                  maxLength={255}
                  onChange={(event) => update(index, "address", event.target.value)}
                  aria-invalid={addressError ? true : undefined}
                  aria-describedby={addressError ? `${addressId}-error` : undefined}
                  className="h-10 rounded-lg"
                />
                <FieldError id={`${addressId}-error`} message={addressError} />
              </div>
              <button
                type="button"
                onClick={() => setRows((current) => current.filter((_, i) => i !== index))}
                aria-label={`Remove ${row.name || "new terminal"}`}
                className={cn(iconButton, "sm:mt-6")}
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">
        Terminals that staff, loading programs or tickets belong to can&apos;t be removed.
      </p>
    </Section>
  );
}

interface ItemRow {
  rowKey: string;
  /** Null for items added here; a key is made from the label on save. */
  key: string | null;
  label: string;
  input: "toggle" | "count";
  max: number;
}

interface SectionRow {
  rowKey: string;
  title: string;
  items: ItemRow[];
}

function toSections(checklist: ChecklistItem[]): SectionRow[] {
  const sections: SectionRow[] = [];
  for (const item of checklist) {
    let section = sections.at(-1);
    if (!section || section.title !== item.section_title) {
      section = { rowKey: rowKey(), title: item.section_title, items: [] };
      sections.push(section);
    }
    section.items.push({ rowKey: rowKey(), key: item.key, label: item.label, input: item.input, max: item.max ?? 1 });
  }
  return sections;
}

/** "Fire Extinguisher" → "fire_extinguisher", unique among the keys already used. */
function keyFor(label: string, used: Set<string>): string {
  const base = (label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "item").replace(/^(\d)/, "item_$1").slice(0, 36);
  let key = base;
  for (let n = 2; used.has(key); n++) key = `${base}_${n}`;
  used.add(key);
  return key;
}

function toChecklist(sections: SectionRow[]): ChecklistItem[] {
  const used = new Set(sections.flatMap((section) => section.items.map((item) => item.key).filter((key): key is string => key !== null)));
  return sections.flatMap((section, sectionIndex) =>
    section.items.map((item) => ({
      key: item.key ?? keyFor(item.label, used),
      label: item.label,
      section_no: sectionIndex + 1,
      section_title: section.title,
      input: item.input,
      ...(item.input === "count" && { max: item.max }),
    })),
  );
}

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

function ChecklistSection({ checklist, onSaved }: { checklist: ChecklistItem[]; onSaved: (settings: Settings) => void }) {
  const [sections, setSections] = useState(() => toSections(checklist));
  const { save, errors, message, pending, error } = useSectionSave(onSaved);

  const updateSection = (sectionIndex: number, change: (section: SectionRow) => SectionRow) =>
    setSections((current) => current.map((section, i) => (i === sectionIndex ? change(section) : section)));
  const updateItem = (sectionIndex: number, itemIndex: number, change: Partial<ItemRow>) =>
    updateSection(sectionIndex, (section) => ({
      ...section,
      items: section.items.map((item, i) => (i === itemIndex ? { ...item, ...change } : item)),
    }));

  const itemCount = sections.reduce((total, section) => total + section.items.length, 0);
  const generalErrors = [...(errors.checklist ?? []), message];
  // Errors are keyed by position in the flat list sent to the API: a section's first item sits
  // after every item in the sections before it.
  const offsets = sections.map((_, index) =>
    sections.slice(0, index).reduce((total, section) => total + section.items.length, 0),
  );

  return (
    <Section
      title="Safety Checklist"
      description="What Safety checks before a truck may load. Approval needs every tick-box item ticked; counted items record a number."
      footer={
        <>
          <Button
            variant="secondary"
            onClick={() => setSections((current) => [...current, { rowKey: rowKey(), title: "", items: [] }])}
            disabled={pending}
          >
            <Plus className="size-4" aria-hidden />
            Add Section
          </Button>
          <Button onClick={() => save({ checklist: toChecklist(sections) })} disabled={pending || itemCount === 0}>
            {pending ? "Saving…" : "Save Checklist"}
          </Button>
        </>
      }
    >
      <Alert messages={generalErrors} />
      <ol className="space-y-4">
        {sections.map((section, sectionIndex) => {
          const titleId = `section-${section.rowKey}-title`;
          const titleError = error(`checklist.${offsets[sectionIndex]}.section_title`);
          return (
            <li key={section.rowKey} className="rounded-xl border border-border">
              <div className="flex items-end gap-2 border-b border-border bg-muted/40 p-3">
                <span className="pb-2.5 text-sm font-semibold text-muted-foreground" aria-hidden>
                  {sectionIndex + 1}.
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <Label htmlFor={titleId} className="text-xs">Section {sectionIndex + 1} title</Label>
                  <Input
                    id={titleId}
                    value={section.title}
                    maxLength={80}
                    onChange={(event) => updateSection(sectionIndex, (current) => ({ ...current, title: event.target.value }))}
                    aria-invalid={titleError ? true : undefined}
                    className="h-10 rounded-lg"
                  />
                  <FieldError id={`${titleId}-error`} message={titleError} />
                </div>
                <button
                  type="button"
                  onClick={() => setSections((current) => move(current, sectionIndex, sectionIndex - 1))}
                  disabled={sectionIndex === 0}
                  aria-label={`Move section ${section.title || sectionIndex + 1} up`}
                  className={iconButton}
                >
                  <ArrowUp className="size-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => setSections((current) => move(current, sectionIndex, sectionIndex + 1))}
                  disabled={sectionIndex === sections.length - 1}
                  aria-label={`Move section ${section.title || sectionIndex + 1} down`}
                  className={iconButton}
                >
                  <ArrowDown className="size-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => setSections((current) => current.filter((_, i) => i !== sectionIndex))}
                  aria-label={`Remove section ${section.title || sectionIndex + 1} and its items`}
                  className={iconButton}
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </div>

              <ul className="divide-y divide-border">
                {section.items.map((item, itemIndex) => {
                  const flatIndex = offsets[sectionIndex] + itemIndex;
                  const labelId = `item-${item.rowKey}-label`;
                  const inputId = `item-${item.rowKey}-input`;
                  const maxId = `item-${item.rowKey}-max`;
                  const labelError = error(`checklist.${flatIndex}.label`) ?? error(`checklist.${flatIndex}.key`);
                  const maxError = error(`checklist.${flatIndex}.max`);
                  return (
                    <li key={item.rowKey} className="flex flex-wrap items-start gap-2 p-3">
                      <div className="min-w-48 flex-1 space-y-1">
                        <Label htmlFor={labelId} className="sr-only">Item label</Label>
                        <Input
                          id={labelId}
                          value={item.label}
                          maxLength={80}
                          placeholder="e.g. First Aid Kit"
                          onChange={(event) => updateItem(sectionIndex, itemIndex, { label: event.target.value })}
                          aria-invalid={labelError ? true : undefined}
                          aria-describedby={labelError ? `${labelId}-error` : undefined}
                          className="h-10 rounded-lg"
                        />
                        <FieldError id={`${labelId}-error`} message={labelError} />
                      </div>
                      <label htmlFor={inputId} className="sr-only">How it&apos;s checked</label>
                      <select
                        id={inputId}
                        value={item.input}
                        onChange={(event) => updateItem(sectionIndex, itemIndex, { input: event.target.value as ItemRow["input"] })}
                        className={selectClass}
                      >
                        <option value="toggle">Tick box</option>
                        <option value="count">Count</option>
                      </select>
                      {item.input === "count" && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <label htmlFor={maxId} className="text-xs text-muted-foreground">Max</label>
                            <Input
                              id={maxId}
                              type="number"
                              min={1}
                              max={20}
                              value={item.max}
                              onChange={(event) => updateItem(sectionIndex, itemIndex, { max: Number(event.target.value) })}
                              aria-invalid={maxError ? true : undefined}
                              className="h-10 w-20 rounded-lg"
                            />
                          </div>
                          <FieldError id={`${maxId}-error`} message={maxError} />
                        </div>
                      )}
                      <div className="flex">
                        <button
                          type="button"
                          onClick={() => updateSection(sectionIndex, (current) => ({ ...current, items: move(current.items, itemIndex, itemIndex - 1) }))}
                          disabled={itemIndex === 0}
                          aria-label={`Move ${item.label || "item"} up`}
                          className={iconButton}
                        >
                          <ArrowUp className="size-4" aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() => updateSection(sectionIndex, (current) => ({ ...current, items: move(current.items, itemIndex, itemIndex + 1) }))}
                          disabled={itemIndex === section.items.length - 1}
                          aria-label={`Move ${item.label || "item"} down`}
                          className={iconButton}
                        >
                          <ArrowDown className="size-4" aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() => updateSection(sectionIndex, (current) => ({ ...current, items: current.items.filter((_, i) => i !== itemIndex) }))}
                          aria-label={`Remove ${item.label || "item"}`}
                          className={iconButton}
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="border-t border-border p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    updateSection(sectionIndex, (current) => ({
                      ...current,
                      items: [...current.items, { rowKey: rowKey(), key: null, label: "", input: "toggle", max: 1 }],
                    }))
                  }
                >
                  <Plus className="size-4" aria-hidden />
                  Add Item
                </Button>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-xs text-muted-foreground">
        Removed items stop appearing for new inspections; past inspections keep their answers.
      </p>
    </Section>
  );
}

function ProductsSection({ products }: { products: Product[] }) {
  return (
    <Section title="Products" description="Products the depot loads. They're fixed in the system; ask the developers to add one.">
      <ul className="flex flex-wrap gap-2">
        {products.map((product) => (
          <li key={product} className="rounded-xl border border-border px-3 py-2 text-sm">
            <span className="font-semibold text-foreground">{product}</span>
            <span className="ml-2 text-muted-foreground">{PRODUCT_NAME[product]}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/** Admin Settings → Depot. Each section edits a draft and saves on its own. */
export function DepotSettings({ settings: initial }: { settings: Settings }) {
  const [settings, setSettings] = useState(initial);
  // Bumping a section's version rebuilds its draft from what was saved, e.g. new terminal IDs.
  const [versions, setVersions] = useState({ tolerance: 0, terminals: 0, checklist: 0 });

  const savedBy = (section: keyof typeof versions) => (saved: Settings) => {
    setSettings(saved);
    setVersions((current) => ({ ...current, [section]: current[section] + 1 }));
  };

  return (
    <div className="flex flex-col gap-6">
      <ToleranceSection
        key={`tolerance-${versions.tolerance}`}
        value={settings.overload_tolerance_percent}
        onSaved={savedBy("tolerance")}
      />
      <TerminalsSection key={`terminals-${versions.terminals}`} terminals={settings.terminals} onSaved={savedBy("terminals")} />
      <ChecklistSection key={`checklist-${versions.checklist}`} checklist={settings.checklist} onSaved={savedBy("checklist")} />
      <ProductsSection products={settings.products} />
    </div>
  );
}
