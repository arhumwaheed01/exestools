import { describe, expect, it } from "vitest";
import { PRESETS, presetById, presetText } from "./presets";
import { MAX_ITEM_LENGTH, itemsNeeded, parseList } from "./list";

const BANNED = /\b(bet|bets|betting|jackpot|casino|gambl\w*|cash|wager|odds)\b/i;

describe("presets", () => {
  it("has the 12 required themes", () => {
    expect(PRESETS.map((p) => p.id)).toEqual(["baby-shower", "christmas", "halloween", "thanksgiving", "new-year", "sight-words", "math-facts", "meeting", "road-trip", "bridal-shower", "birthday", "office-party"]);
  });
  it.each(PRESETS.map((p) => [p.id, p] as const))("%s: 25–40 unique items, short, fills its grid, family friendly", (_id, p) => {
    expect(p.items.length).toBeGreaterThanOrEqual(25);
    expect(p.items.length).toBeLessThanOrEqual(40);
    const parsed = parseList(presetText(p));
    expect(parsed.items).toEqual(p.items); // nothing skipped: no duplicates, no long lines
    p.items.forEach((x) => expect([...x].length).toBeLessThanOrEqual(MAX_ITEM_LENGTH));
    expect(p.items.length).toBeGreaterThan(itemsNeeded(p.size, p.free));
    expect(BANNED.test([p.label, p.title, p.hint, ...p.items].join(" "))).toBe(false);
  });
  it("math facts have unique answers (the caller reads answers)", () => {
    const products = presetById("math-facts")!.items.map((f) => f.split(" × ").map(Number).reduce((a, b) => a * b));
    expect(new Set(products).size).toBe(products.length);
  });
  it("sight words are the 40 Dolch pre-primer words", () => {
    expect(presetById("sight-words")!.items.length).toBe(40);
  });
});
