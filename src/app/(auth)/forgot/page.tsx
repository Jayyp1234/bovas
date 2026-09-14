import type { Metadata } from "next";
import Image from "next/image";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password",
};

export default function ForgotPasswordPage() {
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
      <div className="flex min-h-screen items-center justify-center bg-surface px-6 py-12 sm:px-12">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
