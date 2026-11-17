import type { RoundingMode } from "./types";

/**
 * Round a punch (minutes from midnight, 0–1439) per common payroll splits.
 * Exact midpoints follow the ranges in the product brief (7 on 15 → down).
 */
export function roundPunch(minutes: number, mode: RoundingMode): number {
  if (mode === "off") return normalizeMinutes(minutes);
  const inc = mode === "5" ? 5 : mode === "6" ? 6 : 15;
  const halfDownMax = mode === "15" ? 7 : 2; // 1–7 down for 15; 1–2 down for 5/6

  const m = normalizeMinutes(minutes);
  const base = Math.floor(m / inc) * inc;
  const past = m - base;
  if (past === 0) return m;
  if (past <= halfDownMax) return base;
  return normalizeMinutes(base + inc);
}

function normalizeMinutes(m: number): number {
  const n = ((Math.round(m) % 1440) + 1440) % 1440;
  return n;
}

export function roundingChanged(raw: number, rounded: number): boolean {
  return raw !== rounded;
}
