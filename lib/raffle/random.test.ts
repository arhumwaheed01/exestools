// lib/raffle/random.test.ts
import { describe, expect, it } from "vitest";
import { createRandomInt, randomCode, secureRandomInt, CODE_ALPHABET } from "./random";

/** A fake 32-bit source that returns the given values in order. */
const fixed = (...values: number[]) => {
  let i = 0;
  return () => {
    if (i >= values.length) throw new Error("source exhausted");
    return values[i++];
  };
};

describe("createRandomInt (rejection sampling)", () => {
  it("throws away the top values that would cause modulo bias", () => {
    // max 3: limit = floor(2^32 / 3) * 3 = 4294967295, so only 0xFFFFFFFF is rejected.
    const r = createRandomInt(fixed(0xffffffff, 7));
    expect(r(3)).toBe(7 % 3);
  });

  it("rejects about half the values when max is just above 2^31", () => {
    const max = 2 ** 31 + 1; // limit = max, values >= max are rejected
    const r = createRandomInt(fixed(2 ** 31 + 1, 2 ** 32 - 1, 2 ** 31));
    expect(r(max)).toBe(2 ** 31); // first two values rejected, third accepted
  });

  it("never rejects when max divides 2^32 (powers of two)", () => {
    const r = createRandomInt(fixed(0xffffffff));
    expect(r(256)).toBe(255);
  });

  it("validates input", () => {
    expect(() => secureRandomInt(0)).toThrow(RangeError);
    expect(() => secureRandomInt(-1)).toThrow(RangeError);
    expect(() => secureRandomInt(2.5)).toThrow(RangeError);
    expect(() => secureRandomInt(2 ** 32 + 1)).toThrow(RangeError);
    expect(secureRandomInt(1)).toBe(0);
  });
});

describe("secureRandomInt (crypto)", () => {
  it("stays in range", () => {
    for (let i = 0; i < 20_000; i++) {
      const v = secureRandomInt(7);
      expect(v >= 0 && v < 7 && Number.isInteger(v)).toBe(true);
    }
  });

  it("is uniform: chi-square over 6 buckets, 60,000 draws", () => {
    const counts = new Array(6).fill(0);
    const n = 60_000;
    for (let i = 0; i < n; i++) counts[secureRandomInt(6)]++;
    const expected = n / 6;
    const chi2 = counts.reduce((s, c) => s + (c - expected) ** 2 / expected, 0);
    expect(chi2).toBeLessThan(25.74); // df = 5, p = 0.0001 (keeps CI flake rate negligible)
  });
});

describe("randomCode", () => {
  it("uses the unambiguous alphabet", () => {
    for (let i = 0; i < 200; i++) {
      const c = randomCode();
      expect(c).toHaveLength(6);
      expect([...c].every((ch) => CODE_ALPHABET.includes(ch))).toBe(true);
    }
    expect(CODE_ALPHABET).not.toMatch(/[01IO]/);
  });
});
