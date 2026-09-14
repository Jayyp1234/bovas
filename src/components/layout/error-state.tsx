"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/** What a workspace shows when a page fails to load, e.g. the API is unreachable. */
export function ErrorState({ error, reset }: ErrorStateProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-danger-surface text-danger">
        <TriangleAlert className="size-6" aria-hidden />
      </span>
      <div>
        <h1 className="text-lg font-semibold text-foreground">This page didn&apos;t load</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          We couldn&apos;t reach the BOVAS server. Check your connection and try again. If it keeps
          happening, tell an admin{error.digest ? ` and quote reference ${error.digest}` : ""}.
        </p>
      </div>
      <Button onClick={reset}>Try Again</Button>
    </div>
  );
}
