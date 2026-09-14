import "server-only";
import type { PaginationMeta } from "./types";

const PAGE_SIZE = 100;

/** Exports stop here rather than paging without end. */
const MAX_ROWS = 5000;

/** Every row of a paged list endpoint, fetched 100 at a time, for CSV exports. */
export async function allPages<T>(
  fetchPage: (page: number, perPage: number) => Promise<{ data: T[]; meta: PaginationMeta }>,
): Promise<T[]> {
  const rows: T[] = [];

  for (let page = 1; rows.length < MAX_ROWS; page++) {
    const { data, meta } = await fetchPage(page, PAGE_SIZE);
    rows.push(...data);
    if (data.length === 0 || page * PAGE_SIZE >= meta.total) break;
  }

  return rows.slice(0, MAX_ROWS);
}
