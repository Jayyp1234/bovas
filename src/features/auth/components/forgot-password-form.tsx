"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "../actions";
import { initialFormState } from "../form-state";
import { FieldError } from "@/components/ui/field-error";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialFormState);
  const emailError = state.fieldErrors?.email?.[0];

  return (
    <div className="w-full max-w-md">
      <h1 className="text-3xl font-bold text-foreground">Reset your password</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Enter your work email and we&apos;ll send a link to reset your password.
      </p>

      <form action={formAction} noValidate className="mt-8 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground">
            Email address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="name@bovasgroups.com"
            defaultValue={state.values?.email}
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? "email-error" : undefined}
            className="h-14 rounded-xl"
          />
          <FieldError id="email-error" message={emailError} />
        </div>

        {state.message && !state.succeeded && (
          <p role="alert" className="rounded-xl bg-danger-surface px-4 py-3 text-sm font-medium text-danger">
            {state.message}
          </p>
        )}

        <Button type="submit" disabled={pending} className="h-14 w-full rounded-xl text-base">
          {pending ? "Sending…" : "Send reset link"}
        </Button>
      </form>

      {state.succeeded && (
        <p role="status" className="mt-6 rounded-3xl border border-border bg-muted p-4 text-sm text-foreground">
          {state.message}
        </p>
      )}

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/" className="font-medium text-foreground transition-colors hover:text-primary">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
