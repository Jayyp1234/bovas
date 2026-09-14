"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type ParamValue = string | number | null | undefined;

/**
 * Reads and updates the current page's search params. Every change except to `page` itself
 * returns the table to page 1, since the results it paged through have changed.
 */
export function useUrlParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function update(changes: Record<string, ParamValue>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === undefined || value === "") {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    }
    if (!("page" in changes)) {
      next.delete("page");
    }

    const query = next.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  }

  return {
    get: (key: string) => searchParams.get(key),
    /** The current query string, for links such as a CSV download of the same view. */
    query: searchParams.toString(),
    update,
    pending,
  };
}
