// lib/bingo/rng.ts
// Two random sources, on purpose:
//  1. A SEEDED generator (sfc32 seeded by a cyrb128 hash of a short seed string) for building cards.
//     The seed travels in the share link, so the same link always rebuilds the exact same card set.
//  2. The browser's crypto.getRandomValues for the CALLER and for picking new seeds, so nobody can
//     work out the call order from a card link. Never seed the caller from the card seed.
// Pure, no DOM. Same RandomInt contract as lib/raffle/random.ts.

/** Returns an integer in [0, maxExclusive). Must be uniform. */
export type RandomInt = (maxExclusive: number) => number;
/** A source of uniformly distributed 32-bit unsigned integers. */
export type Uint32Source = () => number;

const TWO_32 = 2 ** 32;

/** Uniform integers on top of a 32-bit source, with rejection sampling (no modulo bias). */
export function createRandomInt(next: Uint32Source): RandomInt {
  return (maxExclusive: number) => {
    if (!Number.isInteger(maxExclusive) || maxExclusive <= 0 || maxExclusive > TWO_32) {
      throw new RangeError("maxExclusive must be an integer in 1..2^32");
    }
    const limit = Math.floor(TWO_32 / maxExclusive) * maxExclusive;
    for (;;) {
      const x = next();
      if (x < limit) return x % maxExclusive;
    }
  };
}

/** cyrb128: hashes a string into four 32-bit words (seed material for sfc32). */
export function cyrb128(str: string): [number, number, number, number] {
  let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
  for (let i = 0; i < str.length; i++) {
    const k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  h1 ^= h2 ^ h3 ^ h4; h2 ^= h1; h3 ^= h1; h4 ^= h1;
  return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
}

/** sfc32: small, fast, well-tested PRNG. Deterministic for a given seed string. */
export function seededUint32(seed: string): Uint32Source {
  let [a, b, c, d] = cyrb128(seed);
  const next = () => {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
    let t = (a + b) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    d = (d + 1) | 0;
    t = (t + d) | 0;
    c = (c + t) | 0;
    return t >>> 0;
  };
  for (let i = 0; i < 15; i++) next(); // warm-up, mixes weak seeds
  return next;
}

export const seededRandomInt = (seed: string): RandomInt => createRandomInt(seededUint32(seed));

// crypto-backed source, pooled (browser and Node 20+).
const pool = new Uint32Array(256);
let poolIndex = pool.length;
export const cryptoUint32: Uint32Source = () => {
  if (poolIndex >= pool.length) {
    globalThis.crypto.getRandomValues(pool);
    poolIndex = 0;
  }
  return pool[poolIndex++];
};
export const secureRandomInt: RandomInt = createRandomInt(cryptoUint32);

/** Seed alphabet: no 0/O/1/I so a seed can be read aloud or typed. */
export const SEED_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const SEED_LENGTH = 8;
export const isValidSeed = (s: unknown): s is string =>
  typeof s === "string" && s.length === SEED_LENGTH && [...s].every((ch) => SEED_ALPHABET.includes(ch));

/** New random seed, e.g. "K7F2Q9MX". Shown on every card as the "Set" code. */
export function newSeed(randomInt: RandomInt = secureRandomInt): string {
  let out = "";
  for (let i = 0; i < SEED_LENGTH; i++) out += SEED_ALPHABET[randomInt(SEED_ALPHABET.length)];
  return out;
}

/** In-place Fisher–Yates shuffle. Returns the same array. */
export function shuffleInPlace<T>(arr: T[], randomInt: RandomInt): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** k distinct elements in random order (partial Fisher–Yates on a copy). */
export function sample<T>(items: readonly T[], k: number, randomInt: RandomInt): T[] {
  if (!Number.isInteger(k) || k < 0 || k > items.length) throw new RangeError("k out of range");
  const a = items.slice();
  for (let i = 0; i < k; i++) {
    const j = i + randomInt(a.length - i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, k);
}
