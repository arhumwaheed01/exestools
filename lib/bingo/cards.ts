// lib/bingo/cards.ts
// Builds a deterministic, duplicate-free set of bingo cards from a config + seed.
// Same config + same seed => byte-identical cards (this is what share links rely on).

import { type RandomInt, seededRandomInt, sample, isValidSeed } from "./rng";
import { type GridSize, MAX_CARDS, MAX_ITEMS, freeIndex, itemsNeeded, canHaveFree } from "./list";

export const FREE = "FREE";
/** One square. `null` is the FREE square. */
export type Cell = string | null;

export type BingoMode = "words" | "bingo75" | "numbers";

export interface CardSetConfig {
  mode: BingoMode;
  size: GridSize; // bingo75 is always 5
  free: boolean; // ignored for even sizes
  count: number; // 1..MAX_CARDS
  seed: string; // 8 chars, see rng.ts
  items?: string[]; // words mode (already parsed by list.ts)
  max?: number; // numbers mode: 1..max, max in 9..99
}

export interface Card {
  number: number; // 1-based card number printed on the card
  cells: Cell[]; // row-major, length size*size
}

export const BINGO_LETTERS = ["B", "I", "N", "G", "O"] as const;
/** 75-ball US columns: B 1–15, I 16–30, N 31–45, G 46–60, O 61–75. */
export const columnRange = (col: number): [number, number] => [col * 15 + 1, col * 15 + 15];
export const letterFor = (n: number) => BINGO_LETTERS[Math.floor((n - 1) / 15)];
export const NUMBERS_MIN_MAX = 9;
export const NUMBERS_MAX_MAX = 99;
/** Attempts per card before giving up on finding a new unique card. */
export const MAX_ATTEMPTS_PER_CARD = 500;

export type CardError =
  | { code: "BAD_SEED" }
  | { code: "BAD_COUNT" }
  | { code: "BAD_SIZE" }
  | { code: "NOT_ENOUGH_ITEMS"; needed: number; have: number }
  | { code: "NOT_ENOUGH_UNIQUE"; possible: number; requested: number }
  | { code: "BAD_RANGE" };

export type CardResult = { ok: true; cards: Card[]; sameSquaresOnEveryCard: boolean } | { ok: false; error: CardError };

/** Number of distinct arrangements, capped (we only need to compare with count ≤ 100). */
export function possibleCards(poolSize: number, needed: number, cap = 1_000_000): number {
  if (needed > poolSize) return 0;
  let total = 1;
  for (let i = 0; i < needed; i++) {
    total *= poolSize - i;
    if (total >= cap) return cap;
  }
  return total;
}

const cardKey = (cells: Cell[]) => cells.map((c) => (c === null ? "\u0000" : c)).join("\u0001");

function placeFree(fill: string[], size: GridSize, free: boolean): Cell[] {
  const fi = freeIndex(size, free);
  if (fi < 0) return fill;
  return [...fill.slice(0, fi), null, ...fill.slice(fi)];
}

/** One 75-ball card: each column draws 5 distinct numbers from its range, sorted top to bottom. */
function bingo75Card(free: boolean, rnd: RandomInt): Cell[] {
  const cols: number[][] = [];
  for (let c = 0; c < 5; c++) {
    const [lo, hi] = columnRange(c);
    const range = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
    cols.push(sample(range, 5, rnd).sort((a, b) => a - b));
  }
  const cells: Cell[] = [];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) cells.push(String(cols[c][r]));
  if (free) cells[12] = null;
  return cells;
}

export function validateConfig(cfg: CardSetConfig): CardError | null {
  if (!isValidSeed(cfg.seed)) return { code: "BAD_SEED" };
  if (!Number.isInteger(cfg.count) || cfg.count < 1 || cfg.count > MAX_CARDS) return { code: "BAD_COUNT" };
  if (![3, 4, 5].includes(cfg.size) || (cfg.mode === "bingo75" && cfg.size !== 5)) return { code: "BAD_SIZE" };
  if (cfg.mode === "numbers") {
    const m = cfg.max;
    if (!Number.isInteger(m) || (m as number) < NUMBERS_MIN_MAX || (m as number) > NUMBERS_MAX_MAX) return { code: "BAD_RANGE" };
  }
  if (cfg.mode === "words" && (!cfg.items || cfg.items.length > MAX_ITEMS)) {
    return { code: "NOT_ENOUGH_ITEMS", needed: itemsNeeded(cfg.size, cfg.free), have: cfg.items?.length ?? 0 };
  }
  return null;
}

/** The pool of things that can be called for this set (words, or numbers as strings). */
export function callPool(cfg: Pick<CardSetConfig, "mode" | "items" | "max">): string[] {
  if (cfg.mode === "bingo75") return Array.from({ length: 75 }, (_, i) => String(i + 1));
  if (cfg.mode === "numbers") return Array.from({ length: cfg.max ?? 0 }, (_, i) => String(i + 1));
  return [...(cfg.items ?? [])];
}

export function generateCards(cfg: CardSetConfig): CardResult {
  const bad = validateConfig(cfg);
  if (bad) return { ok: false, error: bad };
  const rnd = seededRandomInt(`${cfg.seed}|${cfg.mode}|${cfg.size}|${cfg.free ? 1 : 0}`);
  const free = cfg.free && canHaveFree(cfg.size);

  let make: () => Cell[];
  let possible: number;
  let sameSquares = false;
  if (cfg.mode === "bingo75") {
    make = () => bingo75Card(free, rnd);
    possible = 1_000_000;
  } else {
    const pool = callPool(cfg);
    const needed = itemsNeeded(cfg.size, free);
    if (pool.length < needed) return { ok: false, error: { code: "NOT_ENOUGH_ITEMS", needed, have: pool.length } };
    possible = possibleCards(pool.length, needed);
    sameSquares = pool.length === needed && cfg.count > 1;
    make = () => placeFree(sample(pool, needed, rnd), cfg.size, free);
  }
  if (possible < cfg.count) return { ok: false, error: { code: "NOT_ENOUGH_UNIQUE", possible, requested: cfg.count } };

  const seen = new Set<string>();
  const cards: Card[] = [];
  while (cards.length < cfg.count) {
    let placed = false;
    for (let attempt = 0; attempt < MAX_ATTEMPTS_PER_CARD; attempt++) {
      const cells = make();
      const k = cardKey(cells);
      if (seen.has(k)) continue;
      seen.add(k);
      cards.push({ number: cards.length + 1, cells });
      placed = true;
      break;
    }
    if (!placed) return { ok: false, error: { code: "NOT_ENOUGH_UNIQUE", possible: cards.length, requested: cfg.count } };
  }
  return { ok: true, cards, sameSquaresOnEveryCard: sameSquares };
}

/** Defensive check used by tests and by the print view: returns card numbers that repeat an earlier card. */
export function findDuplicateCards(cards: Card[]): number[] {
  const seen = new Set<string>();
  const dups: number[] = [];
  for (const c of cards) {
    const k = cardKey(c.cells);
    if (seen.has(k)) dups.push(c.number);
    else seen.add(k);
  }
  return dups;
}

/** Display label for a square. */
export const cellLabel = (c: Cell) => (c === null ? FREE : c);

/** Exact error copy (role="alert"). */
export function cardErrorMessage(e: CardError): string {
  switch (e.code) {
    case "NOT_ENOUGH_ITEMS":
      return `A card needs ${e.needed} items and your list has ${e.have}. Add ${e.needed - e.have} more, choose a smaller grid, or turn on the FREE square.`;
    case "NOT_ENOUGH_UNIQUE":
      return `Your list can only make ${e.possible} different ${e.possible === 1 ? "card" : "cards"}, and you asked for ${e.requested}. Add more items or make fewer cards.`;
    case "BAD_COUNT":
      return `Choose between 1 and ${MAX_CARDS} cards.`;
    case "BAD_RANGE":
      return `Choose a highest number between ${NUMBERS_MIN_MAX} and ${NUMBERS_MAX_MAX}.`;
    case "BAD_SIZE":
      return "75-ball bingo uses a 5×5 card. Pick 5×5, or switch to Numbers for 3×3 and 4×4.";
    case "BAD_SEED":
      return "This card set code looks damaged. Press New cards to make a fresh set.";
  }
}
