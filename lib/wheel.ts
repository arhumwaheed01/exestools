/** Wheel geometry & spin math. Pointer is fixed at the top of the canvas. */

import { randomFloat } from "@/lib/random";

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

/** Per-slice angles (radians) from weights; equal weights → equal slices. */
export function weightedSliceAngles(weights: readonly number[]): number[] {
  const n = weights.length;
  if (n === 0) return [];
  const safe = weights.map((w) => Math.max(0.01, Number(w) || 0.01));
  const total = safe.reduce((a, b) => a + b, 0);
  return safe.map((w) => (w / total) * Math.PI * 2);
}

export function pickWeightedIndex(weights: readonly number[]): number {
  const n = weights.length;
  if (n <= 0) return -1;
  const safe = weights.map((w) => Math.max(0.01, Number(w) || 0.01));
  const total = safe.reduce((a, b) => a + b, 0);
  let r = randomFloat() * total;
  for (let i = 0; i < n; i++) {
    r -= safe[i]!;
    if (r <= 0) return i;
  }
  return n - 1;
}

/**
 * Segments are drawn from -PI/2 with ctx.rotate(rotation) clockwise.
 * Returns the index under the fixed top pointer.
 */
export function winnerIndexAt(
  rotation: number,
  count: number,
  weights?: readonly number[],
): number {
  if (count <= 0) return -1;
  if (!weights || weights.length !== count) {
    const slice = sliceAngle(count);
    const normalized = normalizeAngle(-rotation);
    return Math.floor(normalized / slice) % count;
  }
  const angles = weightedSliceAngles(weights);
  const normalized = normalizeAngle(-rotation);
  let acc = 0;
  for (let i = 0; i < count; i++) {
    acc += angles[i]!;
    if (normalized < acc - 1e-9) return i;
  }
  return count - 1;
}

/**
 * Target absolute rotation so `index` lands under the pointer.
 * By default lands at a random point inside the slice (kept off the edges so it
 * doesn't look like a near-miss / tie). Pass `sliceT` in 0–1 to pin the spot.
 */
export function targetRotationForIndex(
  index: number,
  count: number,
  currentRotation: number,
  extraSpins = 5,
  sliceT?: number,
  weights?: readonly number[],
): number {
  const edge = 0.12;
  const t =
    typeof sliceT === "number"
      ? Math.min(1 - edge, Math.max(edge, sliceT))
      : edge + randomFloat() * (1 - 2 * edge);

  let within: number;
  if (weights && weights.length === count) {
    const angles = weightedSliceAngles(weights);
    let start = 0;
    for (let i = 0; i < index; i++) start += angles[i]!;
    within = start + angles[index]! * t;
  } else {
    const slice = sliceAngle(count);
    within = index * slice + slice * t;
  }

  const landing = normalizeAngle(-within);
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
  return parseChoicesWithStats(raw).choices;
}

export type ParsedChoices = {
  choices: string[];
  duplicatesSkipped: number;
  overLimit: number;
};

const MAX_CHOICES = 60;

/** Deduplicate first (unless allowDuplicates), then cap so over-limit lines aren't mislabelled as duplicates. */
export function parseChoicesWithStats(
  raw: string,
  opts?: { allowDuplicates?: boolean; max?: number },
): ParsedChoices {
  const max = Math.min(MAX_CHOICES, Math.max(2, opts?.max ?? MAX_CHOICES));
  const lines = raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  const seen = new Set<string>();
  const unique: string[] = [];
  let duplicatesSkipped = 0;
  for (const line of lines) {
    const truncated = line.length > 64 ? `${line.slice(0, 63)}…` : line;
    if (opts?.allowDuplicates) {
      unique.push(truncated);
      continue;
    }
    const key = truncated.toLocaleLowerCase();
    if (seen.has(key)) {
      duplicatesSkipped++;
      continue;
    }
    seen.add(key);
    unique.push(truncated);
  }
  const choices = unique.slice(0, max);
  const overLimit = Math.max(0, unique.length - max);
  return { choices, duplicatesSkipped, overLimit };
}

export function choicesToText(choices: string[]): string {
  return choices.join("\n");
}
