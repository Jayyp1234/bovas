import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getMe } from "@/lib/api/auth";
import type { Role, User } from "@/lib/api/types";
import { getSessionToken } from "./session";

/** The signed-in staff member, fetched once per request. Null when signed out or the session has ended. */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = await getSessionToken();
  return token ? getMe(token) : null;
});

/**
 * Guards a workspace: signed-out visitors go to sign in, and staff from another workspace see
 * "no access". Returns the signed-in staff member.
 */
export async function requireRole(role: Role | Role[]): Promise<User> {
  const user = await getCurrentUser();
  const allowed = Array.isArray(role) ? role : [role];

  if (!user) {
    redirect((await getSessionToken()) ? "/?reason=expired" : "/");
  }
  if (!user.role || !allowed.includes(user.role)) {
    redirect("/no-access");
  }

  return user;
}
