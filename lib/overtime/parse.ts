/**
 * Parse a day-hours field: blank → 0, "8.5" → 8.5, "8:30" → 8.5.
 * Returns null for unparseable or out-of-range values (>24 or negative).
 */
export function parseDayHours(raw: string): number | null {
  const s = raw.trim();
  if (!s) return 0;

  const colon = s.match(/^(\d{1,2}):(\d{1,2})$/);
  if (colon) {
    const h = Number(colon[1]);
    const m = Number(colon[2]);
    if (!Number.isFinite(h) || !Number.isFinite(m) || m >= 60 || h < 0 || m < 0) return null;
    const total = h + m / 60;
    if (total > 24) return null;
    return total;
  }

  const n = Number(s);
  if (!Number.isFinite(n) || n < 0) return null;
  if (n > 24) return null;
  return n;
}

export function roundMoney(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function roundHours(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function formatMoney(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatHours(n: number): string {
  return roundHours(n).toFixed(2);
}
