"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  /** Called on Escape, the close button or a click on the backdrop. */
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * A modal on the native <dialog> element: the browser keeps focus inside it, closes it on
 * Escape and makes the rest of the page inert.
 */
export function Dialog({ open, onClose, title, description, children, className }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Escape closes the dialog even when focus has left it, e.g. after its submit button was
  // disabled while saving. Listening on the document covers that; the native close only fires
  // while focus is inside.
  useEffect(() => {
    if (!open) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onClose();
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open, onClose]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        // The dialog element itself only receives clicks on its backdrop.
        if (event.target === event.currentTarget) onClose();
      }}
      className={cn(
        "m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-surface p-0 text-foreground shadow-xl backdrop:bg-foreground/40",
        className,
      )}
    >
      {open && (
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 id={titleId} className="text-base font-bold text-foreground">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="-m-1 inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"
            >
              <X className="size-4" />
            </button>
          </div>
          {description && <div className="mt-2 text-sm text-muted-foreground">{description}</div>}
          <div className="mt-5">{children}</div>
        </div>
      )}
    </dialog>
  );
}
