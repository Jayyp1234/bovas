import type { NextRequest } from "next/server";
import { TRUCK_TYPES } from "@/domain/labels";
import { downloadActivityReport } from "@/lib/api/reports";
import { requireRole } from "@/lib/auth/current-user";
import { oneOfParam, textParam, timeParams } from "@/lib/search-params";

/**
 * `/download/activity-report?period=&year=&truck_type=&q=` — the Activity Report as it's
 * filtered on screen, as a CSV. Downloads go through here so the API token stays on the server.
 */
export async function GET(request: NextRequest) {
  await requireRole(["admin", "logistics"]);
  const params = Object.fromEntries(request.nextUrl.searchParams);

  return downloadActivityReport({
    ...timeParams(params),
    truck_type: oneOfParam(params, "truck_type", TRUCK_TYPES),
    q: textParam(params, "q"),
  });
}
