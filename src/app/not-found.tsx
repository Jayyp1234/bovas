import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <SearchX className="size-6" aria-hidden />
      </span>
      <div>
        <h1 className="text-lg font-semibold text-foreground">We couldn&apos;t find that page</h1>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          The ticket, waybill or page may not exist, or the link may be mistyped.
        </p>
      </div>
      <Link href="/" className={buttonVariants()}>
        Back to BOVAS
      </Link>
    </main>
  );
}
