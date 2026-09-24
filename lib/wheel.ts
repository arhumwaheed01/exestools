/** Wheel geometry & spin math. Pointer is fixed at the top of the canvas. */

export const WHEEL_COLORS = [
  "#06b6d4",
  "#14b8a6",
  "#22c55e",
  "#84cc16",
  "#eab308",
  "#f59e0b",
  "#f97316",
  "#ef4444",
  "#ec4899",
  "#a855f7",
  "#6366f1",
  "#0ea5e9",
] as const;

export function normalizeAngle(a: number): number {
  const t = a % (Math.PI * 2);
  return t < 0 ? t + Math.PI * 2 : t;
}

export function sliceAngle(count: number): number {
  return (Math.PI * 2) / Math.max(count, 1);
}

/**
 * Segments are drawn from -PI/2 with ctx.rotate(rotation) clockwise.
 * Returns the index under the fixed top pointer.
 */
export function winnerIndexAt(rotation: number, count: number): number {
  if (count <= 0) return -1;
  const slice = sliceAngle(count);
  const normalized = normalizeAngle(-rotation);
  return Math.floor(normalized / slice) % count;
}

/** Target absolute rotation so mid-segment of `index` lands under the pointer. */
export function targetRotationForIndex(
  index: number,
  count: number,
  currentRotation: number,
  extraSpins = 5,
): number {
  const slice = sliceAngle(count);
  const mid = index * slice + slice / 2;
  const landing = normalizeAngle(-mid);
  const current = normalizeAngle(currentRotation);
  let delta = normalizeAngle(landing - current);
  if (delta < 0.12) delta += Math.PI * 2;
  return currentRotation + delta + extraSpins * Math.PI * 2;
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function truncateLabel(text: string, max = 16): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export function parseChoicesText(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of raw.split(/\r?\n/)) {
    const v = line.trim();
    if (!v) continue;
    const key = v.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v.slice(0, 64));
    if (out.length >= 60) break;
  }
  return out;
}

export function choicesToText(choices: string[]): string {
  return choices.join("\n");
}

export function shuffleArray<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}
