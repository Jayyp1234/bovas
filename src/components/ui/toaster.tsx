"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CircleCheck, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { TOAST_MESSAGES } from "@/config/toasts";

type ToastTone = "success" | "error";

interface Toast {
  id: number;
  tone: ToastTone;
  message: string;
}

const TOAST_DURATION_MS = 4000;

const ToastContext = createContext<(message: string, tone?: ToastTone) => void>(() => {});

/** Shows a short confirmation at the bottom of the screen, e.g. `toast("Staff deactivated")`. */
export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, tone: ToastTone = "success") => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, tone, message }]);
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), TOAST_DURATION_MS);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex flex-col items-center gap-2 px-4 print:hidden"
      >
        {toasts.map((toast) => (
          <p
            key={toast.id}
            role={toast.tone === "error" ? "alert" : "status"}
            className={cn(
              "pointer-events-auto flex max-w-md items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg",
              toast.tone === "success" ? "bg-foreground text-surface" : "bg-danger text-on-solid",
            )}
          >
            {toast.tone === "success" ? <CircleCheck className="size-4 shrink-0" /> : <TriangleAlert className="size-4 shrink-0" />}
            {toast.message}
          </p>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * Shows the confirmation a redirecting server action asked for with `?toast=<key>`, then takes
 * the param out of the URL so a refresh doesn't show it again.
 */
export function FlashToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const show = useToast();
  const key = searchParams.get("toast");

  useEffect(() => {
    if (!key) return;
    const message = TOAST_MESSAGES[key as keyof typeof TOAST_MESSAGES];
    if (message) show(message);

    const next = new URLSearchParams(searchParams.toString());
    next.delete("toast");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [key, pathname, router, searchParams, show]);

  return null;
}
