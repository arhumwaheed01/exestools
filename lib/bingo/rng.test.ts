import { describe, expect, it } from "vitest";
import { createRandomInt, isValidSeed, newSeed, sample, seededRandomInt, seededUint32, shuffleInPlace } from "./rng";

describe("seeded rng", () => {
  it("is deterministic for the same seed", () => {
    const a = seededUint32("K7F2Q9MX"), b = seededUint32("K7F2Q9MX");
    for (let i = 0; i < 50; i++) expect(a()).toBe(b());
  });
  it("differs for different seeds", () => {
    const a = seededUint32("K7F2Q9MX"), b = seededUint32("K7F2Q9MY");
    const xs = Array.from({ length: 10 }, a), ys = Array.from({ length: 10 }, b);
    expect(xs).not.toEqual(ys);
  });
  it("is roughly uniform (chi-square, 10 buckets, 20k draws)", () => {
    const r = seededRandomInt("ABCDEFGH");
    const counts = Array(10).fill(0);
    for (let i = 0; i < 20000; i++) counts[r(10)]++;
    const chi = counts.reduce((s, c) => s + (c - 2000) ** 2 / 2000, 0);
    expect(chi).toBeLessThan(27.88); // p = 0.001, 9 dof
  });
  it("rejection sampling throws on bad bounds and stays in range", () => {
    const r = createRandomInt(() => 0xffffffff);
    expect(() => r(0)).toThrow();
    const r2 = seededRandomInt("ZZZZZZZZ");
    for (let i = 0; i < 1000; i++) { const v = r2(7); expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThan(7); }
  });
});

describe("seeds, shuffle, sample", () => {
  it("newSeed makes valid 8-char seeds", () => {
    for (let i = 0; i < 100; i++) expect(isValidSeed(newSeed())).toBe(true);
    expect(isValidSeed("K7F2Q9M0")).toBe(false); // 0 not allowed
    expect(isValidSeed("short")).toBe(false);
  });
  it("shuffle is a permutation", () => {
    const a = Array.from({ length: 30 }, (_, i) => i);
    const s = shuffleInPlace([...a], seededRandomInt("SHUFFLE2"));
    expect([...s].sort((x, y) => x - y)).toEqual(a);
  });
  it("sample returns k distinct items and rejects bad k", () => {
    const s = sample([1, 2, 3, 4, 5, 6], 4, seededRandomInt("SAMPLE22"));
    expect(new Set(s).size).toBe(4);
    expect(() => sample([1, 2], 3, seededRandomInt("SAMPLE22"))).toThrow();
  });
});
