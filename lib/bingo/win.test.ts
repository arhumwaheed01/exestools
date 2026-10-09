import { describe, expect, it } from "vitest";
import { checkCard, evaluate, hexToMarks, marksToHex, markedFromCalls, winMessage, wrongMarks } from "./win";
import type { Cell } from "./cards";

// 5×5 card with labels "r{row}c{col}" and FREE centre
const card: Cell[] = Array.from({ length: 25 }, (_, i) => (i === 12 ? null : `r${Math.floor(i / 5)}c${i % 5}`));
const row = (r: number) => [0, 1, 2, 3, 4].map((c) => `r${r}c${c}`);
const col = (c: number) => [0, 1, 2, 3, 4].map((r) => `r${r}c${c}`);

describe("win checker", () => {
  it("row win", () => {
    const res = checkCard(card, 5, row(0), "line");
    expect(res.win).toBe(true);
    expect(res.report.lines[0]).toMatchObject({ kind: "row", index: 0 });
  });
  it("middle row uses FREE", () => {
    const calls = row(2).filter((x) => x !== "r2c2");
    expect(checkCard(card, 5, calls, "row").win).toBe(true);
  });
  it("column and pattern filtering", () => {
    const calls = col(3);
    expect(checkCard(card, 5, calls, "column").win).toBe(true);
    expect(checkCard(card, 5, calls, "row").win).toBe(false);
    expect(checkCard(card, 5, calls, "diagonal").win).toBe(false);
  });
  it("both diagonals (centre FREE)", () => {
    expect(checkCard(card, 5, ["r0c0", "r1c1", "r3c3", "r4c4"], "diagonal").win).toBe(true);
    expect(checkCard(card, 5, ["r0c4", "r1c3", "r3c1", "r4c0"], "diagonal").report.lines[0].index).toBe(1);
  });
  it("four corners and full card", () => {
    expect(checkCard(card, 5, ["r0c0", "r0c4", "r4c0", "r4c4"], "corners").win).toBe(true);
    const all = card.filter((x): x is string => x !== null);
    expect(checkCard(card, 5, all.slice(1), "full").win).toBe(false);
    expect(checkCard(card, 5, all, "full").win).toBe(true);
  });
  it("matching is case-insensitive", () => {
    expect(markedFromCalls(["Snowman", null], ["snowman"])).toEqual([true, true]);
  });
  it("no win copy counts FREE", () => {
    const rep = evaluate(5, markedFromCalls(card, ["r0c0"]));
    expect(winMessage(7, false, "line", rep, 5)).toBe("Card 7 doesn't have bingo yet: 2 of 25 squares called (FREE included).");
    const rep2 = evaluate(5, markedFromCalls(card, col(1)));
    expect(winMessage(7, true, "line", rep2, 5)).toBe("Card 7 has bingo: column 2.");
  });
  it("3×3 and 4×4 grids", () => {
    const c3: Cell[] = ["a", "b", "c", "d", null, "f", "g", "h", "i"];
    expect(checkCard(c3, 3, ["a", "i"], "diagonal").win).toBe(true);
    const c4: Cell[] = Array.from({ length: 16 }, (_, i) => `x${i}`);
    expect(checkCard(c4, 4, ["x0", "x5", "x10", "x15"], "diagonal").win).toBe(true);
    expect(() => evaluate(4, [true])).toThrow();
  });
  it("flags squares marked but not called", () => {
    const marks = Array(25).fill(false); marks[0] = true; marks[1] = true; marks[12] = true;
    expect(wrongMarks(card, marks, ["r0c0"])).toEqual([1]);
  });
  it("mark bitmask round-trips and rejects junk", () => {
    const m = Array.from({ length: 25 }, (_, i) => i % 3 === 0);
    expect(hexToMarks(marksToHex(m), 25)).toEqual(m);
    expect(hexToMarks("zz", 25)).toEqual(Array(25).fill(false));
  });
});
