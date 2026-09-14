"use client";

import { useState, useTransition, type FormEvent } from "react";
import { CircleCheck, Download, FileWarning, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDepotDate, formatNumber } from "@/lib/format";
import type { Terminal } from "@/lib/api/types";
import { checkLoadingProgram, uploadLoadingProgram, type ProgramUploadResult } from "../actions";

const selectClass =
  "flex h-11 w-full rounded-xl border border-input bg-surface px-3.5 text-sm text-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";

interface UploadProgramDialogProps {
  terminals: Terminal[];
  defaultTerminalId: number;
  /** Today at the depot, as YYYY-MM-DD. */
  today: string;
}

/**
 * Upload in two steps: check the file (every row is validated, nothing saved), then upload it
 * once it's clean. Changing any field goes back to the check.
 */
export function UploadProgramDialog({ terminals, defaultTerminalId, today }: UploadProgramDialogProps) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<ProgramUploadResult | null>(null);
  const [pending, startTransition] = useTransition();

  const preview = result?.preview;
  const readyToUpload = preview !== undefined && preview.errors.length === 0 && preview.valid_rows > 0;
  const fieldError = (key: string) => result?.fieldErrors?.[key]?.[0];

  function close() {
    if (pending) return;
    setOpen(false);
    setResult(null);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const action = readyToUpload ? uploadLoadingProgram : checkLoadingProgram;
    startTransition(async () => setResult(await action(form)));
  }

  return (
    <>
      <Button className="self-start sm:self-auto" onClick={() => setOpen(true)}>
        <Upload className="size-4" />
        Upload Loading Program
      </Button>

      <Dialog
        open={open}
        onClose={close}
        title="Upload Loading Program"
        className="max-w-lg"
        description={
          <>
            Choose the day&apos;s CSV. Every row is checked against the customers and trucks on file
            before anything is saved.{" "}
            <a
              href="/templates/loading-program.csv"
              download
              className="inline-flex items-center gap-1 font-medium text-foreground underline underline-offset-4"
            >
              <Download className="size-3.5" />
              Download the template
            </a>
          </>
        }
      >
        {result?.program ? (
          <div className="space-y-5">
            <p
              role="status"
              className="flex gap-2 rounded-xl bg-success-surface px-4 py-3 text-sm font-medium text-success"
            >
              <CircleCheck className="mt-0.5 size-4 shrink-0" />
              Uploaded {formatNumber(result.program.item_count)} trucks for{" "}
              {result.program.terminal.name} on {formatDepotDate(result.program.date)}. Logistics
              can start tickets from it now.
            </p>
            <div className="flex justify-end">
              <Button onClick={close}>Done</Button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={submit}
            onChange={() => {
              if (result) setResult(null);
            }}
            noValidate
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="program-date">Program Date</Label>
                <Input
                  id="program-date"
                  name="date"
                  type="date"
                  defaultValue={today}
                  required
                  className="h-11 rounded-xl"
                />
                <FieldError id="program-date-error" message={fieldError("date")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="program-terminal">Terminal</Label>
                <select
                  id="program-terminal"
                  name="terminal_id"
                  defaultValue={defaultTerminalId}
                  className={selectClass}
                >
                  {terminals.map((terminal) => (
                    <option key={terminal.id} value={terminal.id}>
                      {terminal.name}
                    </option>
                  ))}
                </select>
                <FieldError id="program-terminal-error" message={fieldError("terminal_id")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="program-file">CSV File</Label>
              <Input
                id="program-file"
                name="file"
                type="file"
                accept=".csv,text/csv"
                required
                className="h-auto rounded-xl py-2.5 file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground"
              />
              <FieldError id="program-file-error" message={fieldError("file")} />
            </div>

            {result?.message && (
              <p role="alert" className="rounded-xl bg-danger-surface px-4 py-3 text-sm font-medium text-danger">
                {result.message}
              </p>
            )}

            {preview && (
              <div role="status" className="space-y-2 rounded-xl border border-border p-4">
                {preview.errors.length === 0 ? (
                  <p className="flex items-center gap-2 text-sm font-medium text-success">
                    <CircleCheck className="size-4 shrink-0" />
                    All {formatNumber(preview.valid_rows)} rows are ready to upload.
                  </p>
                ) : (
                  <>
                    <p className="flex items-start gap-2 text-sm font-medium text-danger">
                      <FileWarning className="mt-0.5 size-4 shrink-0" />
                      {preview.errors.length} problem{preview.errors.length === 1 ? "" : "s"} to fix
                      {preview.valid_rows > 0 ? ` (${formatNumber(preview.valid_rows)} rows are fine)` : ""}.
                      Correct the file, then check it again.
                    </p>
                    <ul className="max-h-48 space-y-1 overflow-y-auto text-sm text-muted-foreground">
                      {preview.errors.map((problem, index) => (
                        <li key={index}>
                          <span className="font-medium text-foreground">Row {problem.row}:</span>{" "}
                          {problem.message}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-1">
              <Button type="button" variant="secondary" onClick={close} disabled={pending}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending
                  ? readyToUpload
                    ? "Uploading…"
                    : "Checking…"
                  : readyToUpload
                    ? "Upload Program"
                    : "Check File"}
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </>
  );
}
