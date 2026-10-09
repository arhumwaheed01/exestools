// lib/bingo/storage.ts
// localStorage / sessionStorage helpers for the bingo tool.
// Cards are never stored — only settings + seed (regenerate) and player mark bitmasks.

import { isValidSeed } from "./rng";
import { hexToMarks, marksToHex } from "./win";

export const STORAGE_KEY = "exestools.bingo.v1";
export const MARKS_KEY = "exestools.bingo.marks.v1";
export const HASH_KEY = "exestools.bingo.hash.v1";

/** Max stored mark entries; drop oldest keys when exceeded. */
export const MAX_MARK_ENTRIES = 200;

/** Raw textarea cap from §5.1. */
export const MAX_STORED_TEXT = 12_000;

export interface StoredBingo {
  v: 1;
  mode: "words" | "bingo75" | "numbers";
  text: string; // raw textarea (≤ 12,000 chars)
  presetId?: string;
  max: number; // numbers mode
  size: 3 | 4 | 5;
  free: boolean;
  count: number; // 1..100
  title: string;
  subtitle: string;
  paper: "a4" | "letter";
  perPage: 2 | 4;
  callSheet: boolean;
  seed?: string; // current set code
  caller?: { called: string[] };
}

type MarksMap = Record<string, string>;

export function marksStorageKey(seed: string, card: number): string {
  return `${seed}:${card}`;
}

function isStoredBingo(x: unknown): x is StoredBingo {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  if (o.v !== 1) return false;
  if (o.mode !== "words" && o.mode !== "bingo75" && o.mode !== "numbers") return false;
  if (typeof o.text !== "string") return false;
  if (typeof o.max !== "number" || !Number.isFinite(o.max)) return false;
  if (o.size !== 3 && o.size !== 4 && o.size !== 5) return false;
  if (typeof o.free !== "boolean") return false;
  if (typeof o.count !== "number" || !Number.isFinite(o.count)) return false;
  if (typeof o.title !== "string" || typeof o.subtitle !== "string") return false;
  if (o.paper !== "a4" && o.paper !== "letter") return false;
  if (o.perPage !== 2 && o.perPage !== 4) return false;
  if (typeof o.callSheet !== "boolean") return false;
  if (o.presetId !== undefined && typeof o.presetId !== "string") return false;
  if (o.seed !== undefined && !isValidSeed(o.seed)) return false;
  if (o.caller !== undefined) {
    if (!o.caller || typeof o.caller !== "object") return false;
    const called = (o.caller as { called?: unknown }).called;
    if (!Array.isArray(called) || !called.every((c) => typeof c === "string")) return false;
  }
  return true;
}

/** Parse with try/catch and a shape check; on failure return null (never throw). */
export function loadStoredBingo(): StoredBingo | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isStoredBingo(parsed)) return null;
    return {
      ...parsed,
      text: parsed.text.slice(0, MAX_STORED_TEXT),
    };
  } catch {
    return null;
  }
}

export function saveStoredBingo(state: StoredBingo): void {
  try {
    const payload: StoredBingo = {
      ...state,
      v: 1,
      text: state.text.slice(0, MAX_STORED_TEXT),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore quota / private mode */
  }
}

function readMarksMap(): MarksMap {
  try {
    const raw = localStorage.getItem(MARKS_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: MarksMap = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof v === "string" && /^[0-9a-f]{1,8}$/.test(v)) out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

function writeMarksMap(map: MarksMap): void {
  try {
    localStorage.setItem(MARKS_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

/** Load player marks for one card; returns all-false if missing/invalid. */
export function loadMarks(seed: string, card: number, length: number): boolean[] {
  const hex = readMarksMap()[marksStorageKey(seed, card)];
  if (!hex) return Array(length).fill(false);
  return hexToMarks(hex, length);
}

/**
 * Save player marks for one card.
 * Map shape: { [seed + ":" + card]: hex }, max 200 keys (drop oldest).
 */
export function saveMark(seed: string, card: number, marks: boolean[]): void {
  const key = marksStorageKey(seed, card);
  const map = readMarksMap();
  if (key in map) delete map[key]; // refresh insertion order
  map[key] = marksToHex(marks);
  const keys = Object.keys(map);
  if (keys.length > MAX_MARK_ENTRIES) {
    const drop = keys.length - MAX_MARK_ENTRIES;
    for (let i = 0; i < drop; i++) delete map[keys[i]!];
  }
  writeMarksMap(map);
}

/** Clear one card's marks, or every stored mark when seed/card omitted. */
export function clearMarks(seed?: string, card?: number): void {
  try {
    if (seed === undefined || card === undefined) {
      localStorage.removeItem(MARKS_KEY);
      return;
    }
    const map = readMarksMap();
    delete map[marksStorageKey(seed, card)];
    if (Object.keys(map).length === 0) localStorage.removeItem(MARKS_KEY);
    else writeMarksMap(map);
  } catch {
    /* ignore */
  }
}

/** Read the §5.3 fragment hand-off from sessionStorage (e.g. "#b=v1.…" or "#p=v1.…"). */
export function loadHashHandoff(): string | null {
  try {
    const raw = sessionStorage.getItem(HASH_KEY);
    if (!raw || typeof raw !== "string") return null;
    if (!/^#[bp]=v1\./.test(raw)) return null;
    return raw;
  } catch {
    return null;
  }
}

export function clearHashHandoff(): void {
  try {
    sessionStorage.removeItem(HASH_KEY);
  } catch {
    /* ignore */
  }
}
