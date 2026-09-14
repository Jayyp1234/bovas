import type { NextRequest } from "next/server";
import { getStaffAvatar } from "@/lib/api/staff";

interface AvatarRouteContext {
  params: Promise<{ staffNo: string }>;
}

/**
 * `/staff-avatars/BO003?v=…` — a profile picture from bovas-api, loaded with the viewer's
 * session so the token stays on the server. The `v` in the URL changes with each upload, so the
 * browser may keep a picture for a day.
 */
export async function GET(_request: NextRequest, { params }: AvatarRouteContext) {
  const { staffNo } = await params;
  const upstream = await getStaffAvatar(staffNo);

  if (!upstream) {
    return new Response(null, { status: 404 });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "application/octet-stream",
      "Cache-Control": "private, max-age=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
