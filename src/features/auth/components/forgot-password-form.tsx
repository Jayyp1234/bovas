"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="text-3xl font-bold text-foreground">Reset your password</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Enter your email and we&apos;ll send a link to reset your password.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground">
            Email address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="name@company.com"
            className="h-14 rounded-xl"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <Button type="submit" className="h-14 w-full rounded-xl text-base">
          Send reset link
        </Button>
      </form>

      {submitted ? (
        <div className="mt-6 rounded-3xl border border-border bg-muted p-4 text-sm text-foreground">
          If an account exists for <span className="font-medium">{email}</span>, we&apos;ll send a password reset link.
        </div>
      ) : null}

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/" className="font-medium text-foreground transition-colors hover:text-primary">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
