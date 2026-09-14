import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { HOME_BY_ROLE, ROLE_LABEL } from "@/domain/roles";
import { signOut } from "@/features/auth/actions";
import { getCurrentUser } from "@/lib/auth/current-user";

export const metadata: Metadata = { title: "No Access" };

export default async function NoAccessPage() {
  const user = await getCurrentUser();

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-card border border-border bg-surface p-8 text-center">
        <Logo className="mx-auto" />
        <span className="mx-auto mt-6 flex size-12 items-center justify-center rounded-full bg-warning-surface text-warning">
          <ShieldAlert className="size-6" />
        </span>
        <h1 className="mt-4 text-xl font-bold text-foreground">
          You don&apos;t have access to that page
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {user?.role
            ? `You're signed in as ${user.name} (${ROLE_LABEL[user.role]}). That page belongs to another workspace.`
            : "Sign in with an account that has access to continue."}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          {user?.role && (
            <Link href={HOME_BY_ROLE[user.role]} className={buttonVariants()}>
              Go to my workspace
            </Link>
          )}
          <form action={signOut}>
            <Button type="submit" variant="secondary">
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
