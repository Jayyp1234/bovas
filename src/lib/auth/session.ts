import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "./constants";

/*
 * The bearer token lives in an httpOnly cookie, so browser JavaScript can never read it.
 * Only server code (pages, layouts, server actions) sends it on to bovas-api.
 */

export async function getSessionToken(): Promise<string | null> {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

/**
 * Stores the token after sign-in. With `remember`, the cookie lasts until the token expires;
 * otherwise it ends when the browser closes.
 */
export async function startSession(token: string, expiresAt: string, remember: boolean): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(remember && { expires: new Date(expiresAt) }),
  });
}

export async function endSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
