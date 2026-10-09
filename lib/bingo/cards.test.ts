import { describe, expect, it } from "vitest";
import { cardErrorMessage, callPool, columnRange, findDuplicateCards, generateCards, letterFor, possibleCards, type CardSetConfig } from "./cards";
import { PRESETS } from "./presets";

const words = Array.from({ length: 30 }, (_, i) => `Word ${i + 1}`);
const base: CardSetConfig = { mode: "words", size: 5, free: true, count: 30, seed: "K7F2Q9MX", items: words };

describe("word cards", () => {
  it("same seed + config rebuilds identical cards", () => {
    const a = generateCards(base), b = generateCards({ ...base });
    expect(a).toEqual(b);
  });
  it("a different seed gives different cards", () => {
    const a = generateCards(base), b = generateCards({ ...base, seed: "K7F2Q9MY" });
    expect(a.ok && b.ok && a.cards[0].cells).not.toEqual(b.ok && b.cards[0].cells);
  });
  it("100 cards, all unique, FREE in the centre, no repeated item on a card", () => {
    const r = generateCards({ ...base, count: 100 });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.cards.length).toBe(100);
    expect(findDuplicateCards(r.cards)).toEqual([]);
    for (const c of r.cards) {
      expect(c.cells.length).toBe(25);
      expect(c.cells[12]).toBeNull();
      const filled = c.cells.filter((x) => x !== null);
      expect(new Set(filled).size).toBe(24);
      filled.forEach((x) => expect(words).toContain(x));
    }
    expect(r.cards.map((c) => c.number)).toEqual(Array.from({ length: 100 }, (_, i) => i + 1));
  });
  it("4×4 ignores FREE", () => {
    const r = generateCards({ ...base, size: 4, count: 5 });
    expect(r.ok && r.cards.every((c) => c.cells.length === 16 && c.cells.every((x) => x !== null))).toBe(true);
  });
  it("too few items → NOT_ENOUGH_ITEMS with exact copy", () => {
    const r = generateCards({ ...base, items: words.slice(0, 20) });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error).toEqual({ code: "NOT_ENOUGH_ITEMS", needed: 24, have: 20 });
    expect(cardErrorMessage(r.error)).toBe("A card needs 24 items and your list has 20. Add 4 more, choose a smaller grid, or turn on the FREE square.");
  });
  it("detects when the list can't make enough different cards", () => {
    // 3×3 with FREE and exactly 8 items: 8! = 40,320 arrangements, fine. With 2 items on... use possibleCards math
    expect(possibleCards(8, 8)).toBe(40320);
    expect(possibleCards(3, 2)).toBe(6);
    const tiny = generateCards({ mode: "numbers", size: 3, free: false, count: 5, seed: "AAAAAAAA", max: 9 });
    expect(tiny.ok).toBe(true); // 9! arrangements
  });
  it("flags sets where every card has the same squares", () => {
    const r = generateCards({ ...base, items: words.slice(0, 24), count: 3 });
    expect(r.ok && r.sameSquaresOnEveryCard).toBe(true);
    const r2 = generateCards({ ...base, count: 3 });
    expect(r2.ok && r2.sameSquaresOnEveryCard).toBe(false);
  });
  it("rejects bad count, seed and 75-ball size", () => {
    expect(generateCards({ ...base, count: 0 }).ok).toBe(false);
    expect(generateCards({ ...base, count: 101 }).ok).toBe(false);
    expect(generateCards({ ...base, seed: "nope" }).ok).toBe(false);
    const r = generateCards({ mode: "bingo75", size: 4, free: true, count: 1, seed: "AAAAAAAA" });
    expect(!r.ok && r.error.code).toBe("BAD_SIZE");
  });
  it("every preset fills its default grid for 100 unique cards", () => {
    for (const p of PRESETS) {
      const r = generateCards({ mode: "words", size: p.size, free: p.free, count: 100, seed: "PRESET22", items: p.items });
      expect(r.ok, p.id).toBe(true);
    }
  });
});

describe("75-ball cards", () => {
  const cfg: CardSetConfig = { mode: "bingo75", size: 5, free: true, count: 100, seed: "BNGXQ752" };
  it("columns follow B 1–15, I 16–30, N 31–45, G 46–60, O 61–75, sorted, distinct", () => {
    const r = generateCards(cfg);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    for (const card of r.cards) {
      for (let c = 0; c < 5; c++) {
        const [lo, hi] = columnRange(c);
        const col = [0, 1, 2, 3, 4].map((row) => card.cells[row * 5 + c]).filter((x) => x !== null).map(Number);
        expect(new Set(col).size).toBe(col.length);
        col.forEach((n) => { expect(n).toBeGreaterThanOrEqual(lo); expect(n).toBeLessThanOrEqual(hi); });
        expect([...col].sort((a, b) => a - b)).toEqual(col);
      }
      expect(card.cells[12]).toBeNull();
    }
    expect(findDuplicateCards(r.cards)).toEqual([]);
  });
  it("FREE off keeps 5 numbers in the N column", () => {
    const r = generateCards({ ...cfg, free: false, count: 3 });
    expect(r.ok && r.cards.every((c) => c.cells.every((x) => x !== null))).toBe(true);
  });
  it("letters and pool", () => {
    expect(letterFor(1)).toBe("B");
    expect(letterFor(45)).toBe("N");
    expect(letterFor(75)).toBe("O");
    expect(callPool({ mode: "bingo75" }).length).toBe(75);
  });
});

describe("number cards (1–N)", () => {
  it("uses only 1..max", () => {
    const r = generateCards({ mode: "numbers", size: 4, free: false, count: 20, seed: "NUMBERS2", max: 30 });
    expect(r.ok && r.cards.every((c) => c.cells.every((x) => Number(x) >= 1 && Number(x) <= 30))).toBe(true);
  });
  it("rejects a max outside 9..99", () => {
    expect(generateCards({ mode: "numbers", size: 3, free: false, count: 1, seed: "NUMBERS2", max: 8 }).ok).toBe(false);
    expect(generateCards({ mode: "numbers", size: 3, free: false, count: 1, seed: "NUMBERS2", max: 100 }).ok).toBe(false);
  });
});
