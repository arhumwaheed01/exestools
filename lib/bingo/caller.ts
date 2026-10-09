// lib/bingo/caller.ts
// The built-in caller: draws from the pool without repeats, keeps a history, can undo the last call.
// Uses secureRandomInt (crypto) by default — never the card seed — so a card link can't predict calls.

import { type RandomInt, secureRandomInt } from "./rng";
import { letterFor, type BingoMode } from "./cards";

export interface CallerState {
  pool: string[]; // full pool in original order
  called: string[]; // in call order, oldest first
}

export const newCaller = (pool: string[]): CallerState => ({ pool: [...new Set(pool)], called: [] });

export const remaining = (s: CallerState): string[] => {
  const done = new Set(s.called);
  return s.pool.filter((x) => !done.has(x));
};

export const isFinished = (s: CallerState) => s.called.length >= s.pool.length;

/** Draws one uncalled item. Returns the same state (and null) when everything has been called. */
export function drawNext(s: CallerState, randomInt: RandomInt = secureRandomInt): { state: CallerState; call: string | null } {
  const left = remaining(s);
  if (left.length === 0) return { state: s, call: null };
  const call = left[randomInt(left.length)];
  return { state: { ...s, called: [...s.called, call] }, call };
}

/** Removes the most recent call (for "Undo last call" after a mis-tap). */
export function undoLast(s: CallerState): CallerState {
  return s.called.length ? { ...s, called: s.called.slice(0, -1) } : s;
}

/** "B 7" in 75-ball mode, the plain item otherwise. */
export function formatCall(call: string, mode: BingoMode): string {
  return mode === "bingo75" ? `${letterFor(Number(call))} ${call}` : call;
}

/** Text for "Copy called list": numbered, oldest first. */
export function calledListText(s: CallerState, mode: BingoMode, title = "Bingo"): string {
  const lines = s.called.map((c, i) => `${i + 1}. ${formatCall(c, mode)}`);
  return [`${title} — called so far (${s.called.length} of ${s.pool.length})`, ...lines].join("\n");
}

/** Validates a caller state restored from localStorage against the current pool. */
export function restoreCaller(pool: string[], called: unknown): CallerState {
  const base = newCaller(pool);
  if (!Array.isArray(called)) return base;
  const inPool = new Set(base.pool);
  const seen = new Set<string>();
  const ok: string[] = [];
  for (const c of called) {
    if (typeof c === "string" && inPool.has(c) && !seen.has(c)) { seen.add(c); ok.push(c); }
  }
  return { ...base, called: ok };
}
