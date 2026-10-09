import { describe, expect, it } from "vitest";
import { MAX_ITEMS, MAX_ITEM_LENGTH, clampCardCount, freeIndex, itemsNeeded, listStatus, parseList } from "./list";

describe("parseList", () => {
  it("trims, collapses spaces, skips blanks and case-insensitive duplicates", () => {
    const p = parseList("  Apple \n\nbanana\nAPPLE\n  Cherry   pie \n\r\nbanana");
    expect(p.items).toEqual(["Apple", "banana", "Cherry pie"]);
    expect(p.duplicates).toBe(2);
  });
  it("skips lines over the length limit", () => {
    const p = parseList(`ok\n${"x".repeat(MAX_ITEM_LENGTH + 1)}\n${"y".repeat(MAX_ITEM_LENGTH)}`);
    expect(p.items.length).toBe(2);
    expect(p.tooLong).toBe(1);
  });
  it("caps the list at MAX_ITEMS and counts the overflow", () => {
    const text = Array.from({ length: MAX_ITEMS + 7 }, (_, i) => `item ${i}`).join("\n");
    const p = parseList(text);
    expect(p.items.length).toBe(MAX_ITEMS);
    expect(p.overLimit).toBe(7);
  });
  it("keeps commas inside a line (one item per line only)", () => {
    expect(parseList("Smith, John").items).toEqual(["Smith, John"]);
  });
});

describe("grid helpers", () => {
  it("items needed per grid", () => {
    expect(itemsNeeded(5, true)).toBe(24);
    expect(itemsNeeded(5, false)).toBe(25);
    expect(itemsNeeded(3, true)).toBe(8);
    expect(itemsNeeded(4, true)).toBe(16); // no FREE on even sizes
  });
  it("free index is the centre on odd sizes only", () => {
    expect(freeIndex(5, true)).toBe(12);
    expect(freeIndex(3, true)).toBe(4);
    expect(freeIndex(4, true)).toBe(-1);
    expect(freeIndex(5, false)).toBe(-1);
  });
  it("clamps card counts to 1..100", () => {
    expect(clampCardCount(0)).toBe(1);
    expect(clampCardCount(250)).toBe(100);
    expect(clampCardCount(NaN)).toBe(1);
    expect(clampCardCount(12.7)).toBe(12);
  });
  it("status copy", () => {
    const p = parseList("a\nb\na");
    expect(listStatus(p, 8)).toBe("2 items ready. Skipped 1 duplicate line. Add 6 more to fill a card.");
  });
});
