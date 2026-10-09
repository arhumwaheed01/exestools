// lib/bingo/list.ts
// Parses the word list textarea: one item per line, trimmed, inner whitespace collapsed,
// blank lines ignored, duplicates (case-insensitive) skipped and counted, limits enforced.

export const MAX_ITEMS = 200;
export const MAX_ITEM_LENGTH = 40;
export const MAX_TITLE_LENGTH = 60;
export const MAX_SUBTITLE_LENGTH = 80;
export const MAX_CARDS = 100;
export const GRID_SIZES = [3, 4, 5] as const;
export type GridSize = (typeof GRID_SIZES)[number];

export interface ParsedList {
  items: string[];
  duplicates: number; // lines skipped because they repeat an earlier item
  tooLong: number; // lines skipped for being over MAX_ITEM_LENGTH
  overLimit: number; // valid lines skipped because the list hit MAX_ITEMS
}

export const normalizeItem = (s: string) => s.replace(/\s+/g, " ").trim();
const keyOf = (s: string) => s.toLocaleLowerCase();

export function parseList(text: string): ParsedList {
  const seen = new Set<string>();
  const items: string[] = [];
  let duplicates = 0, tooLong = 0, overLimit = 0;
  for (const raw of text.split(/\r?\n/)) {
    const item = normalizeItem(raw);
    if (!item) continue;
    if ([...item].length > MAX_ITEM_LENGTH) { tooLong++; continue; }
    const k = keyOf(item);
    if (seen.has(k)) { duplicates++; continue; }
    if (items.length >= MAX_ITEMS) { overLimit++; continue; }
    seen.add(k);
    items.push(item);
  }
  return { items, duplicates, tooLong, overLimit };
}

/** True when the centre square can be FREE (odd sizes only). */
export const canHaveFree = (size: GridSize) => size % 2 === 1;

/** Number of squares a card needs filled from the list. */
export function itemsNeeded(size: GridSize, free: boolean): number {
  return size * size - (free && canHaveFree(size) ? 1 : 0);
}

/** Index of the FREE square in row-major order, or -1. */
export function freeIndex(size: GridSize, free: boolean): number {
  return free && canHaveFree(size) ? Math.floor((size * size) / 2) : -1;
}

/** Clamp a user-typed card count into 1..MAX_CARDS (NaN → 1). */
export function clampCardCount(n: number): number {
  if (!Number.isFinite(n)) return 1;
  return Math.min(MAX_CARDS, Math.max(1, Math.floor(n)));
}

/** Status line for the list (exact UI copy, used by the polite live region). */
export function listStatus(p: ParsedList, needed: number): string {
  const parts = [`${p.items.length} ${p.items.length === 1 ? "item" : "items"} ready.`];
  if (p.duplicates) parts.push(`Skipped ${p.duplicates} duplicate ${p.duplicates === 1 ? "line" : "lines"}.`);
  if (p.tooLong) parts.push(`Skipped ${p.tooLong} ${p.tooLong === 1 ? "line" : "lines"} over ${MAX_ITEM_LENGTH} characters.`);
  if (p.overLimit) parts.push(`The list is full (${MAX_ITEMS} items). ${p.overLimit} more weren't used.`);
  if (p.items.length < needed) parts.push(`Add ${needed - p.items.length} more to fill a card.`);
  return parts.join(" ");
}
