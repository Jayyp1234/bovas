import type { Metadata } from "next";
import Image from "next/image";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password",
};

export default function ResetPasswordPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden min-h-screen bg-[#f4f2f1] lg:block">
        <Image
          src="/sideimage.png"
          alt="BOVAS & Company fuel logistics — store, dispatch, deliver"
          fill
          priority
          sizes="50vw"
          className="object-contain"
        />
      </div>
      <div className="flex min-h-screen items-center justify-center bg-surface px-6 py-12 sm:px-12">
        <ResetPasswordForm />
      </div>
    </div>
  );
}
