"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("The passwords do not match. Please try again.");
      return;
    }
    setError("");
    router.push("/");
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="text-3xl font-bold text-foreground">Create a new password</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Choose a secure password for your account. You will be able to sign in with the new password immediately.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="new-password" className="text-foreground">
            New password
          </Label>
          <div className="relative">
            <Input
              id="new-password"
              name="newPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Enter new password"
              className="h-14 rounded-xl pr-12"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password" className="text-foreground">
            Confirm password
          </Label>
          <Input
            id="confirm-password"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Confirm new password"
            className="h-14 rounded-xl"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button type="submit" className="h-14 w-full rounded-xl text-base">
          Reset password
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/" className="font-medium text-foreground transition-colors hover:text-primary">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
