import { describe, expect, it } from "vitest";
import { calledListText, drawNext, formatCall, isFinished, newCaller, remaining, restoreCaller, undoLast } from "./caller";
import { seededRandomInt } from "./rng";

const pool75 = Array.from({ length: 75 }, (_, i) => String(i + 1));

describe("caller", () => {
  it("draws every item exactly once, then stops", () => {
    let s = newCaller(pool75);
    const rnd = seededRandomInt("CALLER22");
    for (let i = 0; i < 75; i++) { const r = drawNext(s, rnd); expect(r.call).not.toBeNull(); s = r.state; }
    expect(new Set(s.called).size).toBe(75);
    expect(isFinished(s)).toBe(true);
    const end = drawNext(s, rnd);
    expect(end.call).toBeNull();
    expect(end.state).toBe(s);
  });
  it("works with the default crypto source", () => {
    const r = drawNext(newCaller(["a", "b", "c"]));
    expect(["a", "b", "c"]).toContain(r.call);
    expect(remaining(r.state).length).toBe(2);
  });
  it("undo removes only the last call", () => {
    let s = newCaller(["a", "b", "c"]);
    s = drawNext(s, () => 0).state; // a
    s = drawNext(s, () => 0).state; // b
    expect(undoLast(s).called).toEqual(["a"]);
    expect(undoLast(newCaller(["a"])).called).toEqual([]);
  });
  it("formats 75-ball calls with letters", () => {
    expect(formatCall("7", "bingo75")).toBe("B 7");
    expect(formatCall("68", "bingo75")).toBe("O 68");
    expect(formatCall("Snowman", "words")).toBe("Snowman");
  });
  it("copy text lists calls in order", () => {
    const s = { pool: pool75, called: ["7", "68"] };
    expect(calledListText(s, "bingo75", "Friday Bingo")).toBe("Friday Bingo — called so far (2 of 75)\n1. B 7\n2. O 68");
  });
  it("restores only valid, unique, in-pool calls", () => {
    expect(restoreCaller(["a", "b"], ["a", "a", "z", 3, "b"]).called).toEqual(["a", "b"]);
    expect(restoreCaller(["a"], "junk").called).toEqual([]);
  });
});
