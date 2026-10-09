// lib/bingo/win.ts
// Win checker: given a card and the called items, reports every completed pattern.
// FREE counts as marked. Used by "Check a card" (host) and by the player view's tap marks.

import type { Cell } from "./cards";

export type Pattern = "line" | "row" | "column" | "diagonal" | "corners" | "full";
export const PATTERN_LABELS: Record<Pattern, string> = {
  line: "Any line (row, column or diagonal)",
  row: "Any row",
  column: "Any column",
  diagonal: "Any diagonal",
  corners: "Four corners",
  full: "Full card (blackout)",
};

export interface LineHit { kind: "row" | "column" | "diagonal"; index: number; cells: number[] }
export interface WinReport {
  marked: boolean[]; // per cell
  markedCount: number;
  lines: LineHit[];
  corners: boolean;
  full: boolean;
}

export function markedFromCalls(cells: Cell[], called: Iterable<string>): boolean[] {
  const set = new Set([...called].map((c) => c.toLocaleLowerCase()));
  return cells.map((c) => c === null || set.has(c.toLocaleLowerCase()));
}

export function evaluate(size: number, marked: boolean[]): WinReport {
  if (marked.length !== size * size) throw new RangeError("marked length must be size*size");
  const lines: LineHit[] = [];
  const all = (idx: number[]) => idx.every((i) => marked[i]);
  for (let r = 0; r < size; r++) {
    const idx = Array.from({ length: size }, (_, c) => r * size + c);
    if (all(idx)) lines.push({ kind: "row", index: r, cells: idx });
  }
  for (let c = 0; c < size; c++) {
    const idx = Array.from({ length: size }, (_, r) => r * size + c);
    if (all(idx)) lines.push({ kind: "column", index: c, cells: idx });
  }
  const d1 = Array.from({ length: size }, (_, i) => i * size + i);
  const d2 = Array.from({ length: size }, (_, i) => i * size + (size - 1 - i));
  if (all(d1)) lines.push({ kind: "diagonal", index: 0, cells: d1 });
  if (all(d2)) lines.push({ kind: "diagonal", index: 1, cells: d2 });
  const corners = all([0, size - 1, size * (size - 1), size * size - 1]);
  const markedCount = marked.filter(Boolean).length;
  return { marked, markedCount, lines, corners, full: markedCount === size * size };
}

export function hasPattern(rep: WinReport, p: Pattern): boolean {
  switch (p) {
    case "line": return rep.lines.length > 0;
    case "row": return rep.lines.some((l) => l.kind === "row");
    case "column": return rep.lines.some((l) => l.kind === "column");
    case "diagonal": return rep.lines.some((l) => l.kind === "diagonal");
    case "corners": return rep.corners;
    case "full": return rep.full;
  }
}

export function checkCard(cells: Cell[], size: number, called: Iterable<string>, pattern: Pattern) {
  const rep = evaluate(size, markedFromCalls(cells, called));
  return { win: hasPattern(rep, pattern), report: rep };
}

/** Squares the player marked that have NOT been called (FREE excluded). Used to catch honest mistakes. */
export function wrongMarks(cells: Cell[], playerMarks: boolean[], called: Iterable<string>): number[] {
  const real = markedFromCalls(cells, called);
  return playerMarks.flatMap((m, i) => (m && !real[i] ? [i] : []));
}

/** Exact result copy for "Check a card". */
export function winMessage(cardNumber: number, win: boolean, pattern: Pattern, rep: WinReport, size: number): string {
  if (win) {
    const first = rep.lines.find((l) => pattern === "line" || l.kind === pattern);
    const where = pattern === "full" ? "every square" : pattern === "corners" ? "all four corners"
      : first ? `${first.kind} ${first.kind === "diagonal" ? (first.index === 0 ? "top-left to bottom-right" : "top-right to bottom-left") : first.index + 1}` : "";
    return `Card ${cardNumber} has bingo: ${where}.`;
  }
  return `Card ${cardNumber} doesn't have bingo yet: ${rep.markedCount} of ${size * size} squares called (FREE included).`;
}

// --- Player marks (localStorage): a compact bitmask per card, e.g. key "K7F2Q9MX:12" -> "1f0004" ---
/** Bitmask as hex. Grids are ≤25 cells, so a JS number (53-bit mantissa) is enough. */
export function marksToHex(marks: boolean[]): string {
  let v = 0;
  marks.forEach((m, i) => {
    if (m) v |= 1 << i;
  });
  return (v >>> 0).toString(16);
}
export function hexToMarks(hex: string, length: number): boolean[] {
  if (!/^[0-9a-f]{1,8}$/i.test(hex)) return Array(length).fill(false);
  const v = Number.parseInt(hex, 16);
  if (!Number.isFinite(v)) return Array(length).fill(false);
  return Array.from({ length }, (_, i) => ((v >>> i) & 1) === 1);
}
