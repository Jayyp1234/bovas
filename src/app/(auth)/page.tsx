import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { SignInForm, type SignInNotice } from "@/features/auth/components/sign-in-form";
import { DemoAccounts } from "@/features/auth/components/demo-accounts";
import { landingPath } from "@/domain/roles";
import { usesDemoSignIn } from "@/lib/api/auth";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/lib/api/mock/auth";
import { getCurrentUser } from "@/lib/auth/current-user";

export const metadata: Metadata = {
  title: "Sign In",
};

const NOTICES: Record<string, SignInNotice> = {
  expired: { tone: "warning", text: "Your session has ended. Sign in again to continue." },
  "password-reset": {
    tone: "success",
    text: "Your password has been changed. Sign in with your new password.",
  },
};

interface SignInPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { next, reason } = await searchParams;
  const nextPath = typeof next === "string" ? next : undefined;

  const user = await getCurrentUser();
  if (user?.role) {
    redirect(landingPath(user.role, nextPath));
  }

  const showDemoAccounts = process.env.NODE_ENV !== "production" || usesDemoSignIn();

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden min-h-screen bg-auth-panel lg:block">
        <Image
          src="/sideimage.webp"
          alt="BOVAS & Company fuel logistics — store, dispatch, deliver"
          fill
          priority
          sizes="50vw"
          className="object-contain"
        />
      </div>
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-6 py-12 sm:px-12">
        <SignInForm
          next={nextPath}
          notice={typeof reason === "string" ? NOTICES[reason] : undefined}
        />
        {showDemoAccounts && <DemoAccounts accounts={DEMO_ACCOUNTS} password={DEMO_PASSWORD} />}
      </div>
    </div>
  );
}
