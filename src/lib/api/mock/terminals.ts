import type { Terminal, TerminalList } from "../types";
import { TERMINALS } from "./shared";

/** The depots. Admin Settings edits this list in demo mode. */
export const terminals: Terminal[] = [
  { ...TERMINALS.one, address: "Ibeshe Estate, Ibru Jetty, Apapa, Lagos" },
  { ...TERMINALS.two, address: "Mosheshe Estate, Kirikiri Phase I, Apapa, Lagos" },
];

export async function listTerminals(): Promise<TerminalList> {
  return { data: terminals.map((terminal) => ({ ...terminal })) };
}
