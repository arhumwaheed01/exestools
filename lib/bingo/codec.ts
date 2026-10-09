// lib/bingo/codec.ts
// Share links (fragment only, never sent to the server):
//   Card set (host):    https://www.exestools.com/bingo-card-generator#b=v1.<lz-string>
//   One player's card:  https://www.exestools.com/bingo-card-generator#p=v1.<lz-string>
// Same idea as the existing #w=v1. links: lz-string compressToEncodedURIComponent, 6,000-char cap.
// The link carries the settings, the list and the 8-char seed — the cards are REBUILT from it,
// never stored. Not encrypted: anyone with a link can read the list.

import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import { isValidSeed } from "./rng";
import { MAX_CARDS, MAX_ITEMS, MAX_ITEM_LENGTH, MAX_SUBTITLE_LENGTH, MAX_TITLE_LENGTH, normalizeItem, type GridSize } from "./list";
import { NUMBERS_MAX_MAX, NUMBERS_MIN_MAX, type BingoMode, type CardSetConfig } from "./cards";

export const SET_PREFIX = "#b=v1.";
export const PLAYER_PREFIX = "#p=v1.";
export const MAX_HASH_LENGTH = 6000;

export interface SharedSet extends CardSetConfig {
  title: string;
  subtitle?: string;
}

interface Wire {
  v: 1;
  m: "w" | "s" | "n"; // words / seventy-five / numbers
  z: number; // size
  f: 0 | 1;
  c: number; // count
  d: string; // seed
  t: string; // title
  u?: string; // subtitle
  i?: string[]; // items (words)
  x?: number; // max (numbers)
  k?: number; // player card number (player links only)
}

const MODE_TO: Record<BingoMode, Wire["m"]> = { words: "w", bingo75: "s", numbers: "n" };
const MODE_FROM: Record<Wire["m"], BingoMode> = { w: "words", s: "bingo75", n: "numbers" };

function toWire(s: SharedSet, card?: number): Wire {
  return {
    v: 1,
    m: MODE_TO[s.mode],
    z: s.size,
    f: s.free ? 1 : 0,
    c: s.count,
    d: s.seed,
    t: s.title,
    ...(s.subtitle ? { u: s.subtitle } : {}),
    ...(s.mode === "words" ? { i: s.items ?? [] } : {}),
    ...(s.mode === "numbers" ? { x: s.max } : {}),
    ...(card !== undefined ? { k: card } : {}),
  };
}

function pack(prefix: string, w: Wire): string {
  const hash = prefix + compressToEncodedURIComponent(JSON.stringify(w));
  if (hash.length > MAX_HASH_LENGTH) throw new Error("LINK_TOO_LONG");
  return hash;
}

export const encodeSetHash = (s: SharedSet) => pack(SET_PREFIX, toWire(s));
export function encodePlayerHash(s: SharedSet, cardNumber: number): string {
  if (!Number.isInteger(cardNumber) || cardNumber < 1 || cardNumber > s.count) throw new RangeError("card out of range");
  return pack(PLAYER_PREFIX, toWire(s, cardNumber));
}

const isInt = (v: unknown, min: number, max: number): v is number =>
  typeof v === "number" && Number.isInteger(v) && v >= min && v <= max;
const isStr = (v: unknown, max: number, allowEmpty = false): v is string =>
  typeof v === "string" && [...v].length <= max && (allowEmpty || v.length > 0);

function unpack(prefix: string, hash: string): Wire | null {
  if (!hash.startsWith(prefix) || hash.length > MAX_HASH_LENGTH) return null;
  try {
    const json = decompressFromEncodedURIComponent(hash.slice(prefix.length));
    if (!json) return null;
    const w = JSON.parse(json) as Wire;
    return w && typeof w === "object" ? w : null;
  } catch {
    return null;
  }
}

function fromWire(w: Wire): SharedSet | null {
  if (w.v !== 1 || !(w.m in MODE_FROM)) return null;
  const mode = MODE_FROM[w.m];
  if (!isInt(w.z, 3, 5) || (mode === "bingo75" && w.z !== 5)) return null;
  if (w.f !== 0 && w.f !== 1) return null;
  if (!isInt(w.c, 1, MAX_CARDS) || !isValidSeed(w.d)) return null;
  if (!isStr(w.t, MAX_TITLE_LENGTH, true)) return null;
  if (w.u !== undefined && !isStr(w.u, MAX_SUBTITLE_LENGTH)) return null;
  let items: string[] | undefined;
  if (mode === "words") {
    if (!Array.isArray(w.i) || w.i.length > MAX_ITEMS) return null;
    if (!w.i.every((x) => isStr(x, MAX_ITEM_LENGTH) && normalizeItem(x) === x)) return null;
    const keys = new Set(w.i.map((x) => x.toLocaleLowerCase()));
    if (keys.size !== w.i.length) return null; // duplicates are never produced by encode
    items = w.i;
  } else if (w.i !== undefined) return null;
  if (mode === "numbers" ? !isInt(w.x, NUMBERS_MIN_MAX, NUMBERS_MAX_MAX) : w.x !== undefined) return null;
  return {
    mode,
    size: w.z as GridSize,
    free: w.f === 1,
    count: w.c,
    seed: w.d,
    title: w.t,
    ...(w.u ? { subtitle: w.u } : {}),
    ...(items ? { items } : {}),
    ...(mode === "numbers" ? { max: w.x } : {}),
  };
}

/** Decodes and strictly validates a #b= hash. Null for anything damaged or foreign. */
export function decodeSetHash(hash: string): SharedSet | null {
  const w = unpack(SET_PREFIX, hash);
  if (!w || w.k !== undefined) return null;
  return fromWire(w);
}

/** Decodes a #p= hash into the set plus the player's card number. */
export function decodePlayerHash(hash: string): { set: SharedSet; card: number } | null {
  const w = unpack(PLAYER_PREFIX, hash);
  if (!w) return null;
  const set = fromWire(w);
  if (!set || !isInt(w.k, 1, set.count)) return null;
  return { set, card: w.k };
}

/** Which kind of bingo fragment (if any) the page was opened with. */
export function readBingoHash(hash: string): "set" | "player" | null {
  if (/^#b=v1\.[A-Za-z0-9+$-]+$/.test(hash)) return "set";
  if (/^#p=v1\.[A-Za-z0-9+$-]+$/.test(hash)) return "player";
  return null;
}

const PATH = "/bingo-card-generator";
export const setUrl = (origin: string, s: SharedSet) => `${origin}${PATH}${encodeSetHash(s)}`;
export const playerUrl = (origin: string, s: SharedSet, n: number) => `${origin}${PATH}${encodePlayerHash(s, n)}`;
