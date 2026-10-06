// lib/raffle/random.ts
// Unbiased random integers from crypto.getRandomValues. Pure, no DOM.
// If the repo already has the shared P3-07 helper (same contract), import that instead.

/** Returns an integer in [0, maxExclusive). Must be uniform. */
export type RandomInt = (maxExclusive: number) => number;

/** A source of uniformly distributed 32-bit unsigned integers. */
export type Uint32Source = () => number;

const TWO_32 = 2 ** 32;

/**
 * Builds a uniform integer generator on top of a 32-bit source using rejection sampling.
 * Values at or above the largest multiple of maxExclusive are thrown away, so no
 * remainder is more likely than another (no modulo bias).
 */
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

// Pool of 256 values so long draws don't call getRandomValues once per number.
const pool = new Uint32Array(256);
let poolIndex = pool.length;

/** crypto.getRandomValues-backed 32-bit source (browser and Node 20+). */
export const cryptoUint32: Uint32Source = () => {
  if (poolIndex >= pool.length) {
    globalThis.crypto.getRandomValues(pool);
    poolIndex = 0;
  }
  return pool[poolIndex++]!;
};

/** The generator every raffle draw uses unless a test injects its own. */
export const secureRandomInt: RandomInt = createRandomInt(cryptoUint32);

/** Short human-friendly code, e.g. "K7F2Q9". No 0/O/1/I to avoid misreading. */
export const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function randomCode(length = 6, randomInt: RandomInt = secureRandomInt): string {
  let out = "";
  for (let i = 0; i < length; i++) out += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]!;
  return out;
}
