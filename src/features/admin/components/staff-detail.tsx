"use client";

import { useRef, useState, useTransition, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Copy, Pencil, Upload } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toaster";
import { ROLE_LABEL } from "@/domain/roles";
import { ACCESS_OPTIONS, DEPARTMENTS, ROLE_TITLES } from "@/domain/staff";
import type { Role, Terminal, User } from "@/lib/api/types";
import {
  createStaffAction,
  deleteStaffAction,
  removeAvatarAction,
  setStaffActiveAction,
  updateStaffAction,
  uploadAvatarAction,
} from "../staff-actions";

type ActionResult = Awaited<ReturnType<typeof updateStaffAction>>;

const selectClass =
  "flex h-12 w-full rounded-xl border border-input bg-surface px-3.5 text-sm text-foreground transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 aria-invalid:border-danger";

function ReadField({ label, value, copyable }: { label: string; value: string; copyable?: boolean }) {
  const toast = useToast();

  return (
    <div>
      <p className="mb-1.5 text-sm text-muted-foreground">{label}</p>
      <div className="flex h-12 items-center justify-between gap-2 rounded-xl border border-input bg-surface px-3.5">
        <span className="truncate text-sm font-medium text-foreground">{value}</span>
        {copyable && (
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(value).then(() => toast(`${label} copied.`))}
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

function FormField({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-foreground">
        {label}
      </Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/admin/staff"
      className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ChevronLeft className="size-4" />
      Staff Management
    </Link>
  );
}

function DetailView({ staff, isSelf, onEdit }: { staff: User; isSelf: boolean; onEdit: () => void }) {
  const router = useRouter();
  const toast = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
  const [dialog, setDialog] = useState<"delete" | "status" | null>(null);
  const [dialogMessage, setDialogMessage] = useState<string>();
  const [pending, startTransition] = useTransition();

  function run(step: () => Promise<ActionResult>, inDialog: boolean) {
    startTransition(async () => {
      const result = await step();
      // A successful delete redirects, so nothing comes back.
      if (!result) return;

      if (result.ok) {
        toast(result.message);
        setDialog(null);
        router.refresh();
      } else if (inDialog) {
        setDialogMessage(result.message);
      } else {
        toast(result.message, "error");
      }
    });
  }

  function open(next: "delete" | "status") {
    setDialogMessage(undefined);
    setDialog(next);
  }

  function uploadPicture(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const form = new FormData();
    form.append("file", file);
    run(() => uploadAvatarAction(staff.staff_no, form), false);
  }

  return (
    <>
      <BackLink />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold tracking-tight text-foreground">Staff ID - {staff.staff_no}</h1>
          <Badge variant={staff.active ? "success" : "neutral"} withDot>
            {staff.active ? "Active" : "Inactive"}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!isSelf && (
            <Button variant="destructive" size="sm" onClick={() => open("delete")}>
              Delete Profile
            </Button>
          )}
          {!(isSelf && staff.active) && (
            <Button variant="secondary" size="sm" onClick={() => open("status")}>
              {staff.active ? "Deactivate" : "Activate"}
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={onEdit}>
            Edit
            <Pencil className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[260px_1fr]">
        <div className="flex flex-col items-center gap-4">
          <Avatar name={staff.name} src={staff.avatar_url ?? undefined} className="size-48 rounded-2xl text-4xl" />
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={uploadPicture}
            className="sr-only"
            tabIndex={-1}
            aria-hidden
          />
          <button
            type="button"
            disabled={pending}
            onClick={() => fileInput.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            <Upload className="size-4" />
            {staff.avatar_url ? "Change Profile Picture" : "Upload Profile Picture"}
          </button>
          <p className="-mt-2 text-center text-xs text-muted-foreground">JPEG, PNG or WebP, up to 2 MB.</p>
          {staff.avatar_url && (
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => removeAvatarAction(staff.staff_no), false)}
              className="text-sm font-medium text-danger transition-colors hover:underline disabled:opacity-50"
            >
              Delete Profile Picture
            </button>
          )}
        </div>

        <div className="space-y-5">
          <ReadField label="Name" value={staff.name} />
          <ReadField label="E-Mail Address" value={staff.email} copyable />
          <ReadField label="Phone Number" value={staff.phone} copyable />
          <ReadField label="Terminal" value={staff.terminal.name} />
          <div className="grid gap-5 sm:grid-cols-2">
            <ReadField label="Department" value={staff.department} />
            <ReadField label="Job Title" value={staff.role_title} />
          </div>
          <ReadField label="App Access" value={staff.role ? ROLE_LABEL[staff.role] : "No app access"} />
        </div>
      </div>

      <Dialog
        open={dialog === "delete"}
        onClose={() => !pending && setDialog(null)}
        title={`Delete ${staff.name}'s profile?`}
        className="max-w-sm"
        description="This is permanent. Staff who appear in ticket history can't be deleted; deactivate their account instead to keep the record."
      >
        {dialogMessage && (
          <p role="alert" className="mb-4 rounded-xl bg-danger-surface px-3 py-2.5 text-sm font-medium text-danger">
            {dialogMessage}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={() => setDialog(null)} disabled={pending}>
            Cancel
          </Button>
          {staff.active && (
            <Button variant="secondary" size="sm" onClick={() => open("status")} disabled={pending}>
              Deactivate Instead
            </Button>
          )}
          <Button
            variant="destructive"
            size="sm"
            disabled={pending}
            onClick={() => run(() => deleteStaffAction(staff.staff_no), true)}
          >
            {pending ? "Deleting…" : "Delete Profile"}
          </Button>
        </div>
      </Dialog>

      <Dialog
        open={dialog === "status"}
        onClose={() => !pending && setDialog(null)}
        title={staff.active ? "Deactivate Staff Account" : "Activate Staff Account"}
        className="max-w-sm"
        description={
          staff.active
            ? `${staff.name} will be signed out and won't be able to sign in until the account is activated again.`
            : `${staff.name} will be able to sign in again.`
        }
      >
        {dialogMessage && (
          <p role="alert" className="mb-4 rounded-xl bg-danger-surface px-3 py-2.5 text-sm font-medium text-danger">
            {dialogMessage}
          </p>
        )}
        <div className="flex justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={() => setDialog(null)} disabled={pending}>
            Cancel
          </Button>
          <Button
            variant={staff.active ? "destructive" : "primary"}
            size="sm"
            disabled={pending}
            onClick={() => run(() => setStaffActiveAction(staff.staff_no, !staff.active), true)}
          >
            {staff.active ? "Deactivate" : "Activate"}
          </Button>
        </div>
      </Dialog>
    </>
  );
}

interface FormValues {
  name: string;
  email: string;
  phone: string;
  terminalId: string;
  department: string;
  roleTitle: string;
  role: Role | "";
  password: string;
}

function initialValues(staff: User | null, terminals: Terminal[]): FormValues {
  return staff
    ? {
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        terminalId: String(staff.terminal.id),
        department: staff.department,
        roleTitle: staff.role_title,
        role: staff.role ?? "",
        password: "",
      }
    : {
        name: "",
        email: "",
        phone: "",
        terminalId: String(terminals[0]?.id ?? ""),
        department: "",
        roleTitle: "",
        role: "",
        password: "",
      };
}

function StaffForm({
  staff,
  staffNo,
  terminals,
  onCancel,
  onSaved,
}: {
  staff: User | null;
  staffNo: string;
  terminals: Terminal[];
  onCancel: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [values, setValues] = useState(() => initialValues(staff, terminals));
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState<string>();
  const [pending, startTransition] = useTransition();

  const error = (key: string) => errors[key]?.[0];
  const invalid = (id: string, key: string) => (errors[key] ? { "aria-invalid": true, "aria-describedby": `${id}-error` } : {});
  const set = (field: keyof FormValues) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setValues((current) => ({ ...current, [field]: event.target.value }));

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      terminal_id: Number(values.terminalId),
      department: values.department,
      role: values.role || null,
      role_title: values.roleTitle,
    };

    startTransition(async () => {
      const result = staff
        ? await updateStaffAction(staff.staff_no, fields)
        : await createStaffAction({ ...fields, temporary_password: values.password });
      // Creating redirects to the new profile, so nothing comes back.
      if (!result) return;

      if (result.ok) {
        toast(result.message);
        onSaved();
        return;
      }
      setErrors(result.fieldErrors);
      setMessage(result.message);
    });
  }

  return (
    <>
      <BackLink />
      <h1 className="text-lg font-bold tracking-tight text-foreground">
        {staff ? `Edit Staff ID - ${staffNo}` : `New Staff ID - ${staffNo}`}
      </h1>

      <form onSubmit={submit} noValidate className="mx-auto max-w-2xl space-y-6">
        {message && (
          <p role="alert" className="rounded-xl bg-danger-surface px-4 py-3 text-sm font-medium text-danger">
            {message}
          </p>
        )}

        <FormField id="staff-name" label="Name" error={error("name")}>
          <Input id="staff-name" value={values.name} onChange={set("name")} placeholder="Enter full name" className="h-12 rounded-xl" {...invalid("staff-name", "name")} />
        </FormField>
        <FormField id="staff-email" label="Email Address" error={error("email")}>
          <Input id="staff-email" type="email" value={values.email} onChange={set("email")} placeholder="name@bovasgroups.com" className="h-12 rounded-xl" {...invalid("staff-email", "email")} />
        </FormField>
        <FormField id="staff-phone" label="Phone Number" error={error("phone")}>
          <Input id="staff-phone" type="tel" value={values.phone} onChange={set("phone")} placeholder="08104205202" className="h-12 rounded-xl" {...invalid("staff-phone", "phone")} />
        </FormField>
        <FormField id="staff-terminal" label="Terminal" error={error("terminal_id")}>
          <select id="staff-terminal" value={values.terminalId} onChange={set("terminalId")} className={selectClass} {...invalid("staff-terminal", "terminal_id")}>
            {terminals.map((terminal) => (
              <option key={terminal.id} value={terminal.id}>
                {terminal.name}
              </option>
            ))}
          </select>
        </FormField>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="staff-department" label="Department" error={error("department")}>
            <select id="staff-department" value={values.department} onChange={set("department")} className={selectClass} {...invalid("staff-department", "department")}>
              <option value="" disabled>
                Select
              </option>
              {DEPARTMENTS.map((department) => (
                <option key={department}>{department}</option>
              ))}
            </select>
          </FormField>
          <FormField id="staff-title" label="Job Title" error={error("role_title")}>
            <select id="staff-title" value={values.roleTitle} onChange={set("roleTitle")} className={selectClass} {...invalid("staff-title", "role_title")}>
              <option value="" disabled>
                Select
              </option>
              {ROLE_TITLES.map((title) => (
                <option key={title}>{title}</option>
              ))}
            </select>
          </FormField>
        </div>
        <FormField id="staff-access" label="App Access" error={error("role")} hint="The workspace this person signs in to.">
          <select id="staff-access" value={values.role} onChange={set("role")} className={selectClass}>
            {ACCESS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
        {!staff && (
          <FormField
            id="staff-password"
            label="Temporary Password"
            error={error("temporary_password")}
            hint="At least 8 characters. It's emailed to the new staff member."
          >
            <Input id="staff-password" type="password" autoComplete="new-password" value={values.password} onChange={set("password")} className="h-12 rounded-xl" {...invalid("staff-password", "temporary_password")} />
          </FormField>
        )}
        {!staff && (
          <p className="text-sm text-muted-foreground">You can add a profile picture once the profile is created.</p>
        )}

        <div className="flex justify-center gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onCancel} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : staff ? "Save Changes" : "Create Profile"}
          </Button>
        </div>
      </form>
    </>
  );
}

interface StaffDetailProps {
  /** The profile to show, or null when adding a new staff member. */
  staff: User | null;
  /** The profile's staff number, or the number a new profile will get. */
  staffNo: string;
  terminals: Terminal[];
  /** The signed-in admin, who can't delete or deactivate themselves. */
  viewerStaffNo: string;
}

export function StaffDetail({ staff, staffNo, terminals, viewerStaffNo }: StaffDetailProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {staff && !editing ? (
        <DetailView staff={staff} isSelf={staff.staff_no === viewerStaffNo} onEdit={() => setEditing(true)} />
      ) : (
        <StaffForm
          staff={staff}
          staffNo={staffNo}
          terminals={terminals}
          onCancel={() => (staff ? setEditing(false) : router.push("/admin/staff"))}
          onSaved={() => {
            setEditing(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
