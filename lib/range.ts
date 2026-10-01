/** Pure helpers for the random number wheel (MB-01 / P3-02). */

export const RANGE_MIN_BOUND = -99_999;
export const RANGE_MAX_BOUND = 99_999;
export const MAX_POOL_SIZE = 1_000;

export type RangeChip = {
  id: string;
  label: string;
  min: number;
  max: number;
  /** When true, chip forces No repeats ON (and usually bingo). */
  forceNoRepeat?: boolean;
  /** When true, chip forces Show bingo letters ON. */
  forceBingo?: boolean;
};

/** Quick range chips, in pack order. Default first visit: 1–10. */
export const RANGE_CHIPS: RangeChip[] = [
  { id: "numbers-1-6", label: "1–6", min: 1, max: 6 },
  { id: "numbers-1-10", label: "1–10", min: 1, max: 10 },
  { id: "numbers-1-20", label: "1–20", min: 1, max: 20 },
  { id: "numbers-1-50", label: "1–50", min: 1, max: 50 },
  {
    id: "numbers-1-75",
    label: "1–75",
    min: 1,
    max: 75,
    forceNoRepeat: true,
    forceBingo: true,
  },
  { id: "numbers-1-100", label: "1–100", min: 1, max: 100 },
  { id: "numbers-1-1000", label: "1–1000", min: 1, max: 1000 },
];

export const ALLOWED_NUMBER_PRESET_QUERY = new Set(RANGE_CHIPS.map((c) => c.id));

export type ValidateOk = { ok: true; min: number; max: number; count: number };
export type ValidateErr = { ok: false; error: string };
export type ValidateResult = ValidateOk | ValidateErr;

/** Parse a raw min/max string (allows leading minus). Rejects decimals and scientific notation. */
export function parseWholeNumberInput(raw: string): number | null {
  const s = raw.trim();
  if (!s) return null;
  if (!/^-?\d+$/.test(s)) return null;
  const n = Number(s);
  if (!Number.isSafeInteger(n)) return null;
  return n;
}

export function validate(minRaw: string, maxRaw: string): ValidateResult {
  const minEmpty = minRaw.trim() === "";
  const maxEmpty = maxRaw.trim() === "";
  if (minEmpty || maxEmpty) {
    return { ok: false, error: "Enter a Min and a Max." };
  }
  const min = parseWholeNumberInput(minRaw);
  const max = parseWholeNumberInput(maxRaw);
  if (min === null || max === null) {
    return { ok: false, error: "Use whole numbers only." };
  }
  if (min < RANGE_MIN_BOUND || min > RANGE_MAX_BOUND || max < RANGE_MIN_BOUND || max > RANGE_MAX_BOUND) {
    return { ok: false, error: "Use numbers between −99,999 and 99,999." };
  }
  if (max <= min) {
    return { ok: false, error: "Max must be bigger than Min." };
  }
  const count = max - min + 1;
  if (count > MAX_POOL_SIZE) {
    return {
      ok: false,
      error: `That's ${count.toLocaleString("en-US")} numbers. The wheel holds up to 1,000 at once.`,
    };
  }
  return { ok: true, min, max, count };
}

/** Inclusive integer range minus drawn values (when No repeats is on). */
export function buildPool(min: number, max: number, drawn: readonly number[] = []): number[] {
  const drawnSet = new Set(drawn);
  const pool: number[] = [];
  for (let n = min; n <= max; n++) {
    if (!drawnSet.has(n)) pool.push(n);
  }
  return pool;
}

/** Label every k-th slice on large wheels. */
export function labelStep(n: number): number {
  if (n <= 60) return 1;
  return Math.ceil(n / 24);
}

/** US bingo letter for 1–75. Returns null outside that range. */
export function bingoLetter(n: number): "B" | "I" | "N" | "G" | "O" | null {
  if (!Number.isInteger(n) || n < 1 || n > 75) return null;
  if (n <= 15) return "B";
  if (n <= 30) return "I";
  if (n <= 45) return "N";
  if (n <= 60) return "G";
  return "O";
}

/** Display with a real minus sign for negatives. */
export function formatNumberLabel(n: number): string {
  if (n < 0) return `−${Math.abs(n)}`;
  return String(n);
}

export function formatBingoCall(n: number): string {
  const letter = bingoLetter(n);
  if (!letter) return formatNumberLabel(n);
  return `${letter} ${formatNumberLabel(n)}`;
}

export function getChipById(id: string): RangeChip | undefined {
  return RANGE_CHIPS.find((c) => c.id === id);
}
