import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  /** A picture URL; a user's `avatar_url` from the API can be passed as it is. */
  src?: string;
  className?: string;
}

/** Derive up to two uppercase initials from a full name. */
function initialsOf(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * `avatar_url` points at bovas-api (`/api/staff/BO003/avatar?v=…`). The browser loads it
 * through the web app's /staff-avatars route, which adds the session token.
 */
function browserSrc(src?: string): string | undefined {
  const match = src?.match(/^\/api\/staff\/([^/?]+)\/avatar(\?.*)?$/);
  return match ? `/staff-avatars/${match[1]}${match[2] ?? ""}` : src;
}

export function Avatar({ name, src, className }: AvatarProps) {
  const url = browserSrc(src);

  return (
    <span
      className={cn(
        "inline-flex size-9 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-semibold text-muted-foreground",
        className,
      )}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={name} className="size-full object-cover" />
      ) : (
        initialsOf(name)
      )}
    </span>
  );
}
