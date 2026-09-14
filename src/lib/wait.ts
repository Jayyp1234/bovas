/** How long a truck has waited, for queue cards: 12 → "12 mins", 75 → "1h 15m". */
export function formatWait(minutes: number): string {
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"}`;
  const hours = Math.floor(minutes / 60);
  return minutes % 60 === 0 ? `${hours}h` : `${hours}h ${minutes % 60}m`;
}
