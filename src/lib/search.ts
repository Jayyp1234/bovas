/** True when the search box is empty or any field contains the query (case-insensitive). */
export function matchesQuery(
  query: string,
  ...fields: (string | null | undefined)[]
): boolean {
  const needle = query.trim().toLowerCase();
  return !needle || fields.some((field) => field?.toLowerCase().includes(needle));
}
