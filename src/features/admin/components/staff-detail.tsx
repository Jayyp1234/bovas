"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Copy, Upload, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar } from "@/components/ui/avatar";
import { getStaffById, type StaffRecord } from "../data/staff";

const TERMINALS = ["Terminal 1", "Terminal 2", "Terminal 3"];
const DEPARTMENTS = [
  "Admin",
  "Safety",
  "Dispatch",
  "Loading",
  "Logistics",
  "Tank Farm",
  "Lab & QA",
];
const ROLES = ["Deputy Depot Manager", "Supervisor", "Staff"];

const selectClass =
  "flex h-12 w-full rounded-xl border border-input bg-surface px-3.5 text-sm text-foreground transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";

function ReadField({
  label,
  value,
  copyable,
}: {
  label: string;
  value: string;
  copyable?: boolean;
}) {
  return (
    <div>
      <p className="mb-1.5 text-sm text-muted-foreground">{label}</p>
      <div className="flex h-12 items-center justify-between gap-2 rounded-xl border border-input bg-surface px-3.5">
        <span className="truncate text-sm font-medium text-foreground">
          {value}
        </span>
        {copyable && (
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(value)}
            aria-label={`Copy ${label}`}
            className="shrink-0 text-subtle transition-colors hover:text-foreground"
          >
            <Copy className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-foreground">{label}</Label>
      {children}
    </div>
  );
}

function ModalShell({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-surface p-6 text-center shadow-xl">
        {children}
      </div>
    </div>
  );
}

function DetailView({
  staff,
  onEdit,
  onDelete,
}: {
  staff: StaffRecord;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold tracking-tight text-foreground">
          Staff ID - {staff.id}
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="destructive" size="sm" onClick={onDelete}>
            Delete Profile
          </Button>
          <Button variant="secondary" size="sm" onClick={onEdit}>
            Edit
            <Pencil className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[260px_1fr]">
        <div className="flex flex-col items-center gap-4">
          <Avatar
            name={staff.name}
            className="size-48 rounded-2xl text-4xl"
          />
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
          >
            <Upload className="size-4" />
            Change Profile Picture
          </button>
          <button
            type="button"
            className="text-sm font-medium text-danger transition-colors hover:underline"
          >
            Delete Profile Picture
          </button>
        </div>

        <div className="space-y-5">
          <ReadField label="Name" value={staff.name} />
          <ReadField label="E-Mail Address" value={staff.email} copyable />
          <ReadField label="Phone Number" value={staff.phone} copyable />
          <ReadField label="Terminal" value={staff.terminal} />
          <div className="grid gap-5 sm:grid-cols-2">
            <ReadField label="Department" value={staff.department} />
            <ReadField label="Role" value={staff.roleTitle} />
          </div>
        </div>
      </div>
    </>
  );
}

function StaffForm({
  staffId,
  onCancel,
  onSubmit,
}: {
  staffId: string;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <>
      <h1 className="text-lg font-bold tracking-tight text-foreground">
        Staff ID - {staffId === "new" ? "BO001" : staffId}
      </h1>

      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <Avatar name="B O" className="size-20 rounded-full text-lg" />
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted"
          >
            <Upload className="size-4" />
            Upload Profile Picture
          </button>
        </div>

        <FormField label="Name">
          <Input placeholder="Enter Full Name" className="h-12 rounded-xl" />
        </FormField>
        <FormField label="Email Address">
          <Input
            type="email"
            placeholder="Enter Work Email Address"
            className="h-12 rounded-xl"
          />
        </FormField>
        <FormField label="Phone Number">
          <Input placeholder="Enter Phone Number" className="h-12 rounded-xl" />
        </FormField>
        <FormField label="Terminal">
          <select className={selectClass} defaultValue="">
            <option value="" disabled>
              Select
            </option>
            {TERMINALS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </FormField>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Department">
            <select className={selectClass} defaultValue="">
              <option value="" disabled>
                Select
              </option>
              {DEPARTMENTS.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Role">
            <select className={selectClass} defaultValue="">
              <option value="" disabled>
                Select
              </option>
              {ROLES.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </FormField>
        </div>
        <FormField label="Password">
          <Input
            type="password"
            placeholder="Enter Temporary Password"
            className="h-12 rounded-xl"
          />
        </FormField>

        <div className="flex justify-center gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Create Profile</Button>
        </div>
      </form>
    </>
  );
}

export function StaffDetail({ staffId }: { staffId: string }) {
  const router = useRouter();
  const isNew = staffId === "new";
  const staff = isNew ? undefined : getStaffById(staffId);
  const [editing, setEditing] = useState(false);
  const [modal, setModal] = useState<null | "delete" | "deactivate">(null);

  if (!isNew && !staff) {
    return (
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-medium text-danger">Staff not found.</p>
      </div>
    );
  }

  const showForm = isNew || editing;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {showForm ? (
        <StaffForm
          staffId={staffId}
          onCancel={() =>
            isNew ? router.push("/admin/staff") : setEditing(false)
          }
          onSubmit={() => router.push("/admin/staff")}
        />
      ) : (
        <DetailView
          staff={staff!}
          onEdit={() => setEditing(true)}
          onDelete={() => setModal("delete")}
        />
      )}

      {modal === "delete" && staff && (
        <ModalShell>
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-danger">
            <span className="text-2xl font-bold leading-none text-white">!</span>
          </div>
          <h2 className="text-base font-bold text-foreground">
            Are you sure you want to delete &ldquo;{staff.name}&rdquo; profile?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This action is permanent and cannot be reversed. You may choose to
            deactivate the account instead to retain the staff record.
          </p>
          <button
            type="button"
            onClick={() => setModal("deactivate")}
            className="mt-5 w-full rounded-lg border border-border py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Deactivate Status
          </button>
          <div className="mt-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setModal(null)}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Cancel
            </button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => router.push("/admin/staff")}
            >
              Delete Profile
            </Button>
          </div>
        </ModalShell>
      )}

      {modal === "deactivate" && staff && (
        <ModalShell>
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-warning-surface">
            <TriangleAlert className="size-6 text-warning" />
          </div>
          <h2 className="text-base font-bold text-foreground">
            Deactivate Staff Account
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Are you sure you want to deactivate &ldquo;{staff.name}&rdquo;
          </p>
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={() => setModal(null)}
              className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Cancel
            </button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => setModal(null)}
            >
              Deactivate
            </Button>
          </div>
        </ModalShell>
      )}
    </div>
  );
}
