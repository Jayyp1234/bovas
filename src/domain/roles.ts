/**
 * Which workspace each role signs in to and which URLs belong to it. Safe for client
 * components and the proxy. The API enforces the same roles on every call.
 */
import type { Role } from "@/lib/api/types";

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin",
  logistics: "Logistics",
  safety: "Safety Officer",
  dispatch: "Dispatch",
};

/** Where each role lands after signing in. */
export const HOME_BY_ROLE: Record<Role, string> = {
  admin: "/admin/dashboard",
  logistics: "/dashboard",
  safety: "/safety/tickets",
  dispatch: "/dispatch",
};

/** URL prefixes owned by each workspace. Mirrors the layouts that guard them. */
const AREAS: Record<Role, string[]> = {
  admin: ["/admin"],
  logistics: [
    "/dashboard",
    "/loading-program",
    "/generate-ticket",
    "/ticket-preview",
    "/ticket-history",
    "/reports",
    "/support",
    "/settings",
  ],
  safety: ["/safety"],
  dispatch: ["/dispatch"],
};

/** The workspace a path belongs to, or null for pages outside every workspace. */
export function roleForPath(path: string): Role | null {
  const pathname = path.split(/[?#]/)[0];
  const match = (Object.entries(AREAS) as [Role, string[]][]).find(([, prefixes]) =>
    prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)),
  );
  return match?.[0] ?? null;
}

/**
 * Where to send someone after sign-in: the page they asked for if their role owns it,
 * otherwise their workspace home. Never leaves the site.
 */
export function landingPath(role: Role, requested?: string | null): string {
  const isLocalPath = requested?.startsWith("/") && !requested.startsWith("//");
  return isLocalPath && canOpen(role, requested!) ? requested! : HOME_BY_ROLE[role];
}

/** Pages outside the workspaces that several roles open, such as a printable waybill. */
export const SHARED_AREAS: { prefix: string; roles: Role[] }[] = [
  { prefix: "/waybills", roles: ["dispatch", "logistics", "admin"] },
];

/** True when the path is in the role's workspace or a shared page the role may open. */
export function canOpen(role: Role, path: string): boolean {
  const pathname = path.split(/[?#]/)[0];
  return (
    roleForPath(pathname) === role ||
    SHARED_AREAS.some(
      (area) =>
        (pathname === area.prefix || pathname.startsWith(`${area.prefix}/`)) && area.roles.includes(role),
    )
  );
}
