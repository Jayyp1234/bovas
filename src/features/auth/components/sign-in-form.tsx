"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { signIn } from "../actions";
import { initialFormState } from "../form-state";
import { FieldError } from "@/components/ui/field-error";

export interface SignInNotice {
  tone: "success" | "warning";
  text: string;
}

interface SignInFormProps {
  /** The page to return to after signing in. */
  next?: string;
  notice?: SignInNotice;
}

export function SignInForm({ next, notice }: SignInFormProps) {
  const [state, formAction, pending] = useActionState(signIn, initialFormState);
  const [showPassword, setShowPassword] = useState(false);
  const emailError = state.fieldErrors?.email?.[0];
  const passwordError = state.fieldErrors?.password?.[0];

  return (
    <form action={formAction} noValidate className="w-full max-w-md">
      <h1 className="text-3xl font-bold text-foreground">Welcome Back!</h1>

      {notice && (
        <p
          role="status"
          className={cn(
            "mt-6 rounded-xl px-4 py-3 text-sm font-medium",
            notice.tone === "success"
              ? "bg-success-surface text-success"
              : "bg-warning-surface text-warning",
          )}
        >
          {notice.text}
        </p>
      )}

      <div className="mt-8 space-y-6">
        {next && <input type="hidden" name="next" value={next} />}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground">
            Work Email Address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Enter your work email"
            defaultValue={state.values?.email}
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? "email-error" : undefined}
            className="h-14 rounded-xl"
          />
          <FieldError id="email-error" message={emailError} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-foreground">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
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
              {showPassword ? (
                <EyeOff className="size-5" />
              ) : (
                <Eye className="size-5" />
              )}
            </button>
          </div>
          <FieldError id="password-error" message={passwordError} />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox name="remember" />
            Remember me
          </label>
          <Link
            href="/forgot"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Forgot password?
          </Link>
        </div>

        {state.message && (
          <p role="alert" className="rounded-xl bg-danger-surface px-4 py-3 text-sm font-medium text-danger">
            {state.message}
          </p>
        )}

        <Button type="submit" disabled={pending} className="h-14 w-full rounded-xl text-base">
          {pending ? "Signing in…" : "Sign In"}
        </Button>
      </div>
    </form>
  );
}
