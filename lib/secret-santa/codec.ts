// Packs reveal/setup data into the URL fragment (#r=… / #s=…).
// OBFUSCATION, NOT ENCRYPTION: anyone with the code below can decode a link.

export interface RevealPayload {
  v: 1;
  g: string;
  r: string;
  c: string;
  e?: string;
  b?: string;
  d?: string;
  n?: string;
}

export interface SetupPayload {
  v: 1;
  p: string[];
  x: [number, number, 0 | 1][];
  o?: 1;
  e?: string;
  b?: string;
  d?: string;
  n?: string;
}

const FORMAT_VERSION = 1;
const KEY = 0x5e_c2_e7_5a;

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]*$/.test(s)) return null;
  try {
    const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
    const bin = atob(b64);
    return Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
  } catch {
    return null;
  }
}

function xorStream(data: Uint8Array, salt: Uint8Array): Uint8Array {
  let x =
    (KEY ^ ((salt[0]! << 24) | (salt[1]! << 16) | (salt[2]! << 8) | salt[3]!)) >>> 0 || 1;
  const out = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    x ^= x << 13;
    x >>>= 0;
    x ^= x >>> 17;
    x ^= x << 5;
    x >>>= 0;
    out[i] = data[i]! ^ (x & 0xff);
  }
  return out;
}

export function encodeToken(payload: unknown, salt?: Uint8Array): string {
  const s = salt ?? globalThis.crypto.getRandomValues(new Uint8Array(4));
  const json = new TextEncoder().encode(JSON.stringify(payload));
  const body = xorStream(json, s);
  const bytes = new Uint8Array(1 + 4 + body.length);
  bytes[0] = FORMAT_VERSION;
  bytes.set(s, 1);
  bytes.set(body, 5);
  return toBase64Url(bytes);
}

export function decodeToken<T>(token: string): T | null {
  const bytes = fromBase64Url(token);
  if (!bytes || bytes.length < 6 || bytes[0] !== FORMAT_VERSION) return null;
  try {
    const json = new TextDecoder("utf-8", { fatal: true }).decode(
      xorStream(bytes.subarray(5), bytes.subarray(1, 5)),
    );
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

const str = (v: unknown, max: number) => typeof v === "string" && v.length > 0 && v.length <= max;

export function decodeReveal(token: string): RevealPayload | null {
  const p = decodeToken<RevealPayload>(token);
  if (!p || p.v !== 1 || !str(p.g, 40) || !str(p.r, 40) || !str(p.c, 8)) return null;
  for (const [k, max] of [
    ["e", 60],
    ["b", 30],
    ["d", 10],
    ["n", 200],
  ] as const) {
    if (p[k] !== undefined && !str(p[k], max)) return null;
  }
  return p;
}

export function decodeSetup(token: string): SetupPayload | null {
  const p = decodeToken<SetupPayload>(token);
  if (!p || p.v !== 1 || !Array.isArray(p.p) || !Array.isArray(p.x)) return null;
  if (p.p.length > 50 || !p.p.every((name) => str(name, 40))) return null;
  const n = p.p.length;
  const okEx = p.x.every(
    (t) =>
      Array.isArray(t) &&
      t.length === 3 &&
      Number.isInteger(t[0]) &&
      Number.isInteger(t[1]) &&
      t[0]! >= 0 &&
      t[1]! >= 0 &&
      t[0]! < n &&
      t[1]! < n &&
      t[0] !== t[1] &&
      (t[2] === 0 || t[2] === 1),
  );
  return okEx ? p : null;
}

export function readHash(hash: string): { kind: "reveal" | "setup"; token: string } | null {
  const m = /^#(r|s)=([A-Za-z0-9_-]+)$/.exec(hash);
  if (!m) return null;
  return { kind: m[1] === "r" ? "reveal" : "setup", token: m[2]! };
}

export const revealUrl = (origin: string, payload: RevealPayload) =>
  `${origin}/secret-santa-generator#r=${encodeToken(payload)}`;

export const setupUrl = (origin: string, payload: SetupPayload) =>
  `${origin}/secret-santa-generator#s=${encodeToken(payload)}`;
