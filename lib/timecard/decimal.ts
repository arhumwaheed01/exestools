/** Half-up rounding to `places` decimal places. */
export function roundHalfUp(value: number, places: number): number {
  if (!Number.isFinite(value)) return 0;
  const f = 10 ** places;
  return Math.round((value + Number.EPSILON) * f) / f;
}

/** Minutes → decimal hours at two places (half-up). */
export function minutesToDecimal(netMinutes: number): number {
  return roundHalfUp(netMinutes / 60, 2);
}

/** Format minutes as H:MM (always non-negative). */
export function formatHhMm(totalMinutes: number): string {
  const m = Math.max(0, Math.round(totalMinutes));
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${h}:${String(min).padStart(2, "0")}`;
}

/** Format decimal hours to two places. */
export function formatDecimal(hours: number): string {
  return minutesToDecimal(Math.round(hours * 60)).toFixed(2);
}
