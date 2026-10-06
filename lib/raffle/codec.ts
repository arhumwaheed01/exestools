// lib/raffle/codec.ts
// Result share links: https://www.exestools.com/raffle-generator#d=v1.<lz-string>
// Same idea as the existing #w=v1. links (lz-string compressToEncodedURIComponent, 6,000-char cap).
// The part after # is never sent to the server. Anyone with the link can read the winners' names.

import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import type { DrawRecord, RecordPick } from "./record";
import { MAX_LABEL_LENGTH, MAX_TICKETS } from "./entries";
import { MAX_ALTERNATES, MAX_WINNERS } from "./draw";
import { CODE_ALPHABET } from "./random";

export const RESULT_PREFIX = "#d=v1.";
export const MAX_RESULT_HASH_LENGTH = 6000;

/** Compact wire format: short keys keep links short. */
interface Wire {
  v: 1;
  c: string; // code
  t: number; // createdAt
  z: number; // tzOffsetMin
  n?: string; // title
  m: "l" | "r"; // mode
  e: number; // entrants
  k: number; // tickets
  o: 0 | 1; // allow repeat winners
  x: 0 | 1; // multiple tickets per person
  u: "c" | "d"; // duplicates: combine / dedupe
  g?: [string, string, number]; // range: from, to, excluded
  f: string; // fingerprint
  p: [number, number]; // planned winners, planned alternates
  w: [string, number, string][]; // winners: label, ticket (0 = none), prize
  a: [string, number][]; // alternates: label, ticket (0 = none)
}

export function encodeResultHash(r: DrawRecord): string {
  const wire: Wire = {
    v: 1,
    c: r.code,
    t: r.createdAt,
    z: r.tzOffsetMin,
    ...(r.title ? { n: r.title } : {}),
    m: r.mode === "range" ? "r" : "l",
    e: r.entrants,
    k: r.tickets,
    o: r.allowRepeatWinners ? 1 : 0,
    x: r.multipleTickets ? 1 : 0,
    u: r.duplicates === "dedupe" ? "d" : "c",
    ...(r.range ? { g: [r.range.from, r.range.to, r.range.excluded] as [string, string, number] } : {}),
    f: r.fingerprint,
    p: [r.plannedWinners, r.plannedAlternates],
    w: r.winners.map((w) => [w.label, w.ticket ?? 0, w.prize ?? ""]),
    a: r.alternates.map((a) => [a.label, a.ticket ?? 0]),
  };
  const hash = RESULT_PREFIX + compressToEncodedURIComponent(JSON.stringify(wire));
  if (hash.length > MAX_RESULT_HASH_LENGTH) throw new Error("RESULT_TOO_LONG");
  return hash;
}

const isStr = (v: unknown, max: number, allowEmpty = false): v is string =>
  typeof v === "string" && v.length <= max && (allowEmpty || v.length > 0);
const isInt = (v: unknown, min: number, max: number): v is number =>
  typeof v === "number" && Number.isInteger(v) && v >= min && v <= max;

/** Decodes and strictly validates a #d= hash. Returns null for anything damaged or foreign. */
export function decodeResultHash(hash: string): DrawRecord | null {
  if (!hash.startsWith(RESULT_PREFIX) || hash.length > MAX_RESULT_HASH_LENGTH) return null;
  let w: Wire;
  try {
    const json = decompressFromEncodedURIComponent(hash.slice(RESULT_PREFIX.length));
    if (!json) return null;
    w = JSON.parse(json) as Wire;
  } catch {
    return null;
  }
  if (!w || typeof w !== "object" || w.v !== 1) return null;
  const codeOk = isStr(w.c, 12) && [...w.c].every((ch) => CODE_ALPHABET.includes(ch));
  if (!codeOk || !isInt(w.t, 0, 8.64e15) || !isInt(w.z, -840, 840)) return null;
  if (w.n !== undefined && !isStr(w.n, 60)) return null;
  if ((w.m !== "l" && w.m !== "r") || !isInt(w.e, 1, MAX_TICKETS) || !isInt(w.k, w.e, MAX_TICKETS)) return null;
  if ((w.o !== 0 && w.o !== 1) || (w.x !== 0 && w.x !== 1) || (w.u !== "c" && w.u !== "d")) return null;
  if (!isStr(w.f, 19) || !/^[0-9A-F]{4}(-[0-9A-F]{4}){3}$/.test(w.f)) return null;
  if (!Array.isArray(w.p) || !isInt(w.p[0], 1, MAX_WINNERS) || !isInt(w.p[1], 0, MAX_ALTERNATES)) return null;
  if (w.g !== undefined) {
    if (!Array.isArray(w.g) || !isStr(w.g[0], 30) || !isStr(w.g[1], 30) || !isInt(w.g[2], 0, 9_999_999)) return null;
  }
  const ticketOk = (t: unknown) => isInt(t, 0, MAX_TICKETS) && (w.m === "r" ? t === 0 : t !== 0);
  if (!Array.isArray(w.w) || w.w.length > w.p[0]) return null;
  if (!w.w.every((x) => Array.isArray(x) && isStr(x[0], MAX_LABEL_LENGTH) && ticketOk(x[1]) && isStr(x[2], 60))) return null;
  if (!Array.isArray(w.a) || w.a.length > w.p[1]) return null;
  if (!w.a.every((x) => Array.isArray(x) && isStr(x[0], MAX_LABEL_LENGTH) && ticketOk(x[1]))) return null;

  const toPick = (label: string, ticket: number): RecordPick => ({ label, ticket: ticket === 0 ? null : ticket });
  return {
    v: 1,
    code: w.c,
    createdAt: w.t,
    tzOffsetMin: w.z,
    ...(w.n ? { title: w.n } : {}),
    mode: w.m === "r" ? "range" : "list",
    entrants: w.e,
    tickets: w.k,
    allowRepeatWinners: w.o === 1,
    multipleTickets: w.x === 1,
    duplicates: w.u === "d" ? "dedupe" : "combine",
    ...(w.g ? { range: { from: w.g[0], to: w.g[1], excluded: w.g[2] } } : {}),
    fingerprint: w.f,
    plannedWinners: w.p[0],
    plannedAlternates: w.p[1],
    winners: w.w.map(([label, ticket, prize]) => ({ ...toPick(label, ticket), prize })),
    alternates: w.a.map(([label, ticket]) => toPick(label, ticket)),
  };
}

/** Reads #d=v1.… from location.hash (or the sessionStorage hand-off). */
export function readResultHash(hash: string): string | null {
  return /^#d=v1\.[A-Za-z0-9+$-]+$/.test(hash) ? hash : null;
}

export const resultUrl = (origin: string, r: DrawRecord) => `${origin}/raffle-generator${encodeResultHash(r)}`;
