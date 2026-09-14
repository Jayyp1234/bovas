"use client";

import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toaster";
import { ROLE_LABEL } from "@/domain/roles";
import type { User } from "@/lib/api/types";
import { changePasswordAction, updateProfileAction } from "../actions";

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <Card className="p-5 sm:p-6">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-5">{children}</div>
    </Card>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

function invalid(id: string, error?: string) {
  return error ? { "aria-invalid": true, "aria-describedby": `${id}-error` } : {};
}

function FormMessage({ message }: { message?: string }) {
  return message ? (
    <p role="alert" className="rounded-xl bg-danger-surface px-3 py-2.5 text-sm font-medium text-danger">
      {message}
    </p>
  ) : null;
}

function ProfileForm({ user }: { user: User }) {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState<string>();
  const [pending, startTransition] = useTransition();
  const unchanged = name === user.name && phone === user.phone;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await updateProfileAction({ name, phone });
      if (result.ok) {
        toast(result.message);
        setErrors({});
        setMessage(undefined);
        router.refresh();
        return;
      }
      setErrors(result.fieldErrors);
      setMessage(result.message);
    });
  }

  const readOnly: [string, string][] = [
    ["Staff ID", user.staff_no],
    ["Email Address", user.email],
    ["Terminal", user.terminal.name],
    ["Department", user.department],
    ["Job Title", user.role_title],
    ["App Access", user.role ? ROLE_LABEL[user.role] : "No app access"],
  ];

  return (
    <Section title="Profile" description="Your name and phone number appear on tickets, inspections and waybills you handle.">
      <div className="flex items-center gap-4">
        <Avatar name={user.name} src={user.avatar_url ?? undefined} className="size-14 text-lg" />
        <div>
          <p className="text-sm font-semibold text-foreground">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.role ? ROLE_LABEL[user.role] : user.role_title}</p>
        </div>
      </div>

      <form onSubmit={submit} noValidate className="mt-6 space-y-4">
        <FormMessage message={message} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="profile-name" label="Name" error={errors.name?.[0]}>
            <Input
              id="profile-name"
              value={name}
              maxLength={120}
              autoComplete="name"
              onChange={(event) => setName(event.target.value)}
              className="h-11 rounded-xl"
              {...invalid("profile-name", errors.name?.[0])}
            />
          </Field>
          <Field id="profile-phone" label="Phone Number" error={errors.phone?.[0]}>
            <Input
              id="profile-phone"
              type="tel"
              value={phone}
              maxLength={20}
              autoComplete="tel"
              onChange={(event) => setPhone(event.target.value)}
              className="h-11 rounded-xl"
              {...invalid("profile-phone", errors.phone?.[0])}
            />
          </Field>
        </div>

        <dl className="grid gap-x-4 gap-y-3 rounded-xl bg-muted/50 p-4 sm:grid-cols-2">
          {readOnly.map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="truncate text-sm font-medium text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="text-xs text-muted-foreground">To change your email, terminal or job title, ask an admin from Support.</p>

        <div className="flex justify-end">
          <Button type="submit" disabled={pending || unchanged}>
            {pending ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Section>
  );
}

const EMPTY_PASSWORDS = { current_password: "", password: "", password_confirmation: "" };

function PasswordForm() {
  const toast = useToast();
  const [values, setValues] = useState(EMPTY_PASSWORDS);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState<string>();
  const [pending, startTransition] = useTransition();

  const set = (field: keyof typeof EMPTY_PASSWORDS) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setValues((current) => ({ ...current, [field]: event.target.value }));

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await changePasswordAction(values);
      if (result.ok) {
        toast(result.message);
        setValues(EMPTY_PASSWORDS);
        setErrors({});
        setMessage(undefined);
        return;
      }
      setErrors(result.fieldErrors);
      setMessage(result.message);
    });
  }

  return (
    <Section title="Change Password" description="Use at least 8 characters. You'll stay signed in here; other devices are signed out.">
      <form onSubmit={submit} noValidate className="space-y-4">
        <FormMessage message={message} />
        <Field id="current-password" label="Current Password" error={errors.current_password?.[0]}>
          <Input
            id="current-password"
            type="password"
            autoComplete="current-password"
            value={values.current_password}
            onChange={set("current_password")}
            className="h-11 rounded-xl"
            {...invalid("current-password", errors.current_password?.[0])}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="new-password" label="New Password" error={errors.password?.[0]}>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={values.password}
              onChange={set("password")}
              className="h-11 rounded-xl"
              {...invalid("new-password", errors.password?.[0])}
            />
          </Field>
          <Field id="confirm-password" label="Confirm New Password">
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={values.password_confirmation}
              onChange={set("password_confirmation")}
              className="h-11 rounded-xl"
            />
          </Field>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={pending || !values.current_password || !values.password}>
            {pending ? "Changing…" : "Change Password"}
          </Button>
        </div>
      </form>
    </Section>
  );
}

/** Settings every workspace shares: your profile and password. */
export function AccountSettings({ user }: { user: User }) {
  return (
    <div className="flex flex-col gap-6">
      <ProfileForm user={user} />
      <PasswordForm />
    </div>
  );
}
