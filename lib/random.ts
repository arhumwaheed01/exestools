/**
 * Cryptographically strong random helpers (rejection sampling).
 * Safe for browser and Node (globalThis.crypto).
 */

function getCrypto(): Crypto {
  const c = globalThis.crypto;
  if (!c?.getRandomValues) {
    throw new Error("crypto.getRandomValues is not available");
  }
  return c;
}

/** Uniform integer in [0, n). Rejects values that would bias the modulus. */
export function randomInt(n: number): number {
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error("randomInt(n): n must be a positive integer");
  }
  if (n === 1) return 0;
  const max = 0x1_0000_0000; // 2^32
  const limit = Math.floor(max / n) * n;
  const buf = new Uint32Array(1);
  const crypto = getCrypto();
  let x: number;
  do {
    crypto.getRandomValues(buf);
    x = buf[0]!;
  } while (x >= limit);
  return x % n;
}

/** Fisher–Yates shuffle on a copy. */
export function shuffle<T>(items: readonly T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}
