import "server-only";
import { apiRequest, fromApi } from "./client";
import * as mock from "./mock/terminals";
import type { TerminalList } from "./types";

/** The depots. `GET /api/terminals` (phase 2) */
export function listTerminals(): Promise<TerminalList> {
  return fromApi<TerminalList>(
    2,
    () => apiRequest("/api/terminals"),
    () => mock.listTerminals(),
  );
}
