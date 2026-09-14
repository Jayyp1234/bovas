"use client";

import { useActionState, useState, type FormEvent } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "../actions";
import { initialFormState } from "../form-state";
import { FieldError } from "@/components/ui/field-error";

function BackToSignIn() {
  return (
    <div className="mt-6 text-center text-sm text-muted-foreground">
      <Link href="/" className="font-medium text-foreground transition-colors hover:text-primary">
        Back to sign in
      </Link>
    </div>
  );
}

/** `token` comes from the emailed link (`/reset?token=…`). */
export function ResetPasswordForm({ token }: { token?: string }) {
  const [state, formAction, pending] = useActionState(resetPassword, initialFormState);
  const [showPassword, setShowPassword] = useState(false);
  const [mismatch, setMismatch] = useState(false);

  const tokenError = state.fieldErrors?.token?.[0];
  const passwordError = mismatch
    ? "The passwords don't match. Type the same password in both fields."
    : state.fieldErrors?.password?.[0];

  function checkMatch(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    const matches = data.get("password") === data.get("password_confirmation");
    setMismatch(!matches);
    if (!matches) event.preventDefault();
  }

  if (!token) {
    return (
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-foreground">This link is incomplete</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Open the reset link from your email again, or{" "}
          <Link href="/forgot" className="font-medium text-foreground underline underline-offset-4">
            request a new one
          </Link>
          .
        </p>
        <BackToSignIn />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="text-3xl font-bold text-foreground">Create a new password</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Choose a password of at least 8 characters. Signing in with the new password works
        straight away, and you&apos;ll be signed out on other devices.
      </p>

      <form action={formAction} onSubmit={checkMatch} noValidate className="mt-8 space-y-6">
        <input type="hidden" name="token" value={token} />

        {tokenError && (
          <p role="alert" className="rounded-xl bg-danger-surface px-4 py-3 text-sm font-medium text-danger">
            {tokenError}{" "}
            <Link href="/forgot" className="underline underline-offset-4">
              Request a new link
            </Link>
          </p>
        )}

        <div className="space-y-2">
          <Label htmlFor="new-password" className="text-foreground">
            New password
          </Label>
          <div className="relative">
            <Input
              id="new-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Enter new password"
              aria-invalid={Boolean(passwordError)}
              aria-describedby={passwordError ? "password-error" : undefined}
              className="h-14 rounded-xl pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-subtle transition-colors hover:text-muted-foreground"
            >
              {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>
          <FieldError id="password-error" message={passwordError} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password" className="text-foreground">
            Confirm password
          </Label>
          <Input
            id="confirm-password"
            name="password_confirmation"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Confirm new password"
            className="h-14 rounded-xl"
          />
        </div>

        {state.message && (
          <p role="alert" className="rounded-xl bg-danger-surface px-4 py-3 text-sm font-medium text-danger">
            {state.message}
          </p>
        )}

        <Button type="submit" disabled={pending} className="h-14 w-full rounded-xl text-base">
          {pending ? "Saving…" : "Reset password"}
        </Button>
      </form>

      <BackToSignIn />
    </div>
  );
}
