import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/constants";

/**
 * A quick check before workspace pages render: visitors without a session cookie go to sign
 * in, remembering the page they wanted. It doesn't validate the token — the workspace layouts
 * confirm the session and role with the API, and the API checks every call.
 */
export function proxy(request: NextRequest) {
  if (request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.next();
  }

  const signIn = new URL("/", request.url);
  signIn.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(signIn);
}

export const config = {
  // Every workspace URL (see AREAS in src/domain/roles.ts) plus the no-access page.
  matcher: [
    "/dashboard/:path*",
    "/loading-program/:path*",
    "/generate-ticket/:path*",
    "/ticket-preview/:path*",
    "/ticket-history/:path*",
    "/reports/:path*",
    "/support/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/safety/:path*",
    "/dispatch/:path*",
    "/waybills/:path*",
    "/download/:path*",
    "/staff-avatars/:path*",
    "/no-access",
  ],
};
