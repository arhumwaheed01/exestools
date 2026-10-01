import { describe, expect, it } from "vitest";
import { randomInt } from "@/lib/random";
import {
  bingoLetter,
  buildPool,
  labelStep,
  parseWholeNumberInput,
  validate,
} from "@/lib/range";

describe("validate", () => {
  it("accepts Min 5 / Max 15 → 11 numbers", () => {
    const r = validate("5", "15");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.count).toBe(11);
  });

  it("rejects Max ≤ Min", () => {
    expect(validate("10", "10")).toEqual({
      ok: false,
      error: "Max must be bigger than Min.",
    });
  });

  it("rejects ranges over 1,000", () => {
    const r = validate("1", "1001");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("1,001");
  });

  it("rejects decimals", () => {
    expect(validate("3.5", "10")).toEqual({
      ok: false,
      error: "Use whole numbers only.",
    });
  });

  it("accepts leading zeros as integers", () => {
    const r = validate("007", "010");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.min).toBe(7);
      expect(r.max).toBe(10);
    }
  });

  it("accepts negatives within bounds", () => {
    const r = validate("-10", "10");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.count).toBe(21);
  });
});

describe("parseWholeNumberInput", () => {
  it("rejects scientific notation", () => {
    expect(parseWholeNumberInput("1e3")).toBeNull();
  });
});

describe("buildPool", () => {
  it("excludes drawn numbers", () => {
    expect(buildPool(1, 5, [2, 4])).toEqual([1, 3, 5]);
  });
});

describe("labelStep", () => {
  it("is 1 for ≤60 and 42 for 1000", () => {
    expect(labelStep(60)).toBe(1);
    expect(labelStep(1000)).toBe(42);
  });
});

describe("bingoLetter", () => {
  it("maps B/I/O boundaries", () => {
    expect(bingoLetter(15)).toBe("B");
    expect(bingoLetter(16)).toBe("I");
    expect(bingoLetter(75)).toBe("O");
    expect(bingoLetter(76)).toBeNull();
  });
});

describe("uniform picks 1–10", () => {
  it("each number ~10% over 100,000 picks (±0.5%)", () => {
    const trials = 100_000;
    const counts = new Array(10).fill(0);
    for (let i = 0; i < trials; i++) counts[randomInt(10)]++;
    for (const c of counts) {
      const p = c / trials;
      expect(p).toBeGreaterThan(0.095);
      expect(p).toBeLessThan(0.105);
    }
  });
});
