import { ApiError } from "../client";
import type {
  LoadingProgram,
  ProgramItem,
  ProgramItemPage,
  ProgramItemQuery,
  ProgramPreview,
} from "../types";
import {
  SAMPLE_DATE,
  STAFF,
  TERMINALS,
  VALIDATION_MESSAGE,
  matchesSearch,
  nowTimestamp,
  paginate,
  terminalById,
} from "./shared";
import { ticketNoByProgramItem, tickets } from "./tickets";

/** Today's loading program: the same trucks as the sample tickets. */
const programItems: Omit<ProgramItem, "ticket_no">[] = tickets.map((ticket, index) => ({
  id: index + 1,
  program_id: 1,
  date: SAMPLE_DATE,
  customer: ticket.customer,
  truck: ticket.truck,
  product: ticket.product,
  quantity_litres: ticket.requested_litres,
  destination: ticket.destination_summary,
}));

/** `date` is ignored: the sample program covers a single day. */
export async function listProgramItems(query: ProgramItemQuery = {}): Promise<ProgramItemPage> {
  const matches = programItems
    .filter((item) => !query.truck_type || item.truck.type === query.truck_type)
    .filter((item) =>
      matchesSearch(query.q, item.customer.name, item.truck.plate, item.destination),
    )
    .map((item) => ({ ...item, ticket_no: ticketNoByProgramItem.get(item.id) ?? null }));

  return paginate(matches, query.page, query.per_page);
}

/** Counts the rows under the header. Demo mode has no customers or trucks to check them against. */
async function countRows(form: FormData): Promise<number> {
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new ApiError(422, VALIDATION_MESSAGE, { file: ["Choose a CSV file to upload."] });
  }

  const rows = (await file.text())
    .split(/\r?\n/)
    .slice(1)
    .filter((line) => line.replace(/,/g, "").trim() !== "");
  if (rows.length === 0) {
    throw new ApiError(422, VALIDATION_MESSAGE, { file: ["The file has no rows under the header."] });
  }

  return rows.length;
}

export async function previewLoadingProgram(form: FormData): Promise<ProgramPreview> {
  return { valid_rows: await countRows(form), errors: [] };
}

export async function uploadLoadingProgram(form: FormData): Promise<LoadingProgram> {
  return {
    id: 2,
    date: String(form.get("date")),
    terminal: terminalById(Number(form.get("terminal_id"))) ?? TERMINALS.one,
    uploaded_by: STAFF.depotManager,
    item_count: await countRows(form),
    uploaded_at: nowTimestamp(),
  };
}
