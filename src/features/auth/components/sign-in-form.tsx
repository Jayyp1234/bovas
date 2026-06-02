"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export function SignInForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // TODO: replace with real authentication. For now, proceed to the dashboard.
    router.push("/dashboard");
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
            autoComplete="username"
            placeholder="Enter your username/work email"
            className="h-14 rounded-xl"
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

        <Button type="submit" className="h-14 w-full rounded-xl text-base">
          Sign In
        </Button>
      </div>
    </form>
  );
}
