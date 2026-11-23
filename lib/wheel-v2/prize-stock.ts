/** Prize wheel only: finite inventory per prize + winners log (stored in this browser). */

export type PrizeLogEntry = { spin: number; prize: string; at: number };

export const PRIZE_QTY_MAX = 999;

const KEY = "et:prize-wheel:stock:v1";

export function clampQty(n: unknown): number {
  const v = Math.floor(Number(n));
  if (!Number.isFinite(v)) return 1;
  return Math.min(PRIZE_QTY_MAX, Math.max(1, v));
}

export function loadPrizeState(): { stock: Record<string, number>; log: PrizeLogEntry[] } {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { stock: {}, log: [] };
    const parsed = JSON.parse(raw) as { stock?: unknown; log?: unknown };
    const stock: Record<string, number> = {};
    if (parsed.stock && typeof parsed.stock === "object") {
      for (const [k, v] of Object.entries(parsed.stock as Record<string, unknown>)) {
        const n = Number(v);
        if (Number.isFinite(n) && n >= 1) stock[k] = clampQty(n);
      }
    }
    const log: PrizeLogEntry[] = [];
    if (Array.isArray(parsed.log)) {
      for (const e of parsed.log.slice(0, 500)) {
        const o = e as Partial<PrizeLogEntry>;
        if (
          o &&
          typeof o.prize === "string" &&
          Number.isFinite(o.spin) &&
          Number.isFinite(o.at)
        ) {
          log.push({ spin: Number(o.spin), prize: o.prize.slice(0, 120), at: Number(o.at) });
        }
      }
    }
    return { stock, log };
  } catch {
    return { stock: {}, log: [] };
  }
}

export function savePrizeState(stock: Record<string, number>, log: PrizeLogEntry[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ stock, log: log.slice(0, 500) }));
  } catch {
    /* ignore */
  }
}
