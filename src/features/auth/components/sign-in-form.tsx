"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";
import { homePathForRole } from "@/lib/auth/roles";
import type { AppRole } from "@/lib/supabase/database.types";

export function SignInForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const identifier = String(form.get("identifier") ?? "").trim();
    const password = String(form.get("password") ?? "");

    if (!identifier || !password) {
      setError("Enter your email and password.");
      return;
    }

    // Local/demo mode: no Supabase env yet — keep the existing mock redirect.
    if (!isSupabaseConfigured()) {
      router.push("/dashboard");
      return;
    }

    setPending(true);
    try {
      const supabase = createClient();
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: identifier,
          password,
        });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      let role: AppRole = "logistics";
      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .maybeSingle();

        if (profile?.role) role = profile.role;
      }

      router.push(homePathForRole(role));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <h1 className="text-3xl font-bold text-foreground">Welcome Back!</h1>

      <div className="mt-8 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="identifier" className="text-foreground">
            Username/Email Address
          </Label>
          <Input
            id="identifier"
            name="identifier"
            type="email"
            autoComplete="username"
            placeholder="Enter your username/work email"
            className="h-14 rounded-xl"
            required
          />
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
              className="h-14 rounded-xl pr-12"
              required
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

        {error ? (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={pending}
          className="h-14 w-full rounded-xl text-base"
        >
          {pending ? "Signing in…" : "Sign In"}
        </Button>
      </div>
    </form>
  );
}
