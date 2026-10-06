// lib/raffle/codec.test.ts
import { describe, expect, it } from "vitest";
import { compressToEncodedURIComponent } from "lz-string";
import { decodeResultHash, encodeResultHash, readResultHash, resultUrl, RESULT_PREFIX } from "./codec";
import type { DrawRecord } from "./record";

const record: DrawRecord = {
  v: 1, code: "K7F2Q9", createdAt: Date.UTC(2026, 9, 6, 9, 32, 5), tzOffsetMin: 300, title: "Spring Fair 🎟️",
  mode: "list", entrants: 48, tickets: 120, allowRepeatWinners: false, multipleTickets: true, duplicates: "combine",
  fingerprint: "3F9A-12C0-77B1-0D4E", plannedWinners: 3, plannedAlternates: 1,
  winners: [
    { label: "Zoë Ahmed", ticket: 14, prize: "Gift basket" },
    { label: "Ben", ticket: 77, prize: "2nd prize" },
    { label: "Smith, John", ticket: 3, prize: "3rd prize" },
  ],
  alternates: [{ label: "Cal", ticket: 101 }],
};

describe("result links", () => {
  it("round-trips a record, including accents, emoji and commas", () => {
    const url = resultUrl("https://www.exestools.com", record);
    const hash = new URL(url).hash;
    expect(readResultHash(hash)).toBe(hash);
    expect(decodeResultHash(hash)).toEqual(record);
  });

  it("round-trips range records (no ticket #s)", () => {
    const r: DrawRecord = {
      ...record, mode: "range", multipleTickets: false, range: { from: "A-001", to: "A-500", excluded: 12 },
      tickets: 488, entrants: 488,
      winners: [{ label: "A-077", ticket: null, prize: "1st prize" }], alternates: [], plannedWinners: 1, plannedAlternates: 0,
    };
    expect(decodeResultHash(encodeResultHash(r))).toEqual(r);
  });

  it("uses the existing link style and stays under 6,000 characters for 100 winners", () => {
    const big: DrawRecord = {
      ...record, plannedWinners: 100, plannedAlternates: 20,
      winners: Array.from({ length: 100 }, (_, i) => ({ label: `Entrant number ${i + 1}`, ticket: i + 1, prize: `${i + 1}th prize` })),
      alternates: Array.from({ length: 20 }, (_, i) => ({ label: `Backup ${i + 1}`, ticket: 200 + i })),
    };
    const hash = encodeResultHash(big);
    expect(hash.startsWith(RESULT_PREFIX)).toBe(true);
    expect(hash.length).toBeLessThan(6000);
  });

  it("refuses to make links over 6,000 characters", () => {
    const huge: DrawRecord = {
      ...record, plannedWinners: 100, plannedAlternates: 20,
      winners: Array.from({ length: 100 }, () => ({
        label: Array.from({ length: 60 }, () => String.fromCharCode(0x4e00 + Math.floor(Math.random() * 2000))).join(""),
        ticket: 1, prize: "x".repeat(60),
      })),
    };
    expect(() => encodeResultHash(huge)).toThrow("RESULT_TOO_LONG");
  });

  it("rejects damaged, foreign or tampered-shape links", () => {
    const hash = encodeResultHash(record);
    expect(decodeResultHash(hash.slice(0, 40))).toBeNull();
    expect(decodeResultHash("#w=v1.abc")).toBeNull();
    expect(decodeResultHash(RESULT_PREFIX + "!!!")).toBeNull();
    const wire = (over: object) =>
      RESULT_PREFIX + compressToEncodedURIComponent(JSON.stringify({
        v: 1, c: "K7F2Q9", t: 1, z: 0, m: "l", e: 2, k: 2, o: 0, x: 0, u: "c", f: "0000-0000-0000-0000",
        p: [1, 0], w: [["Sam", 1, "1st prize"]], a: [], ...over,
      }));
    expect(decodeResultHash(wire({}))).not.toBeNull();
    expect(decodeResultHash(wire({ c: "k7f2q0" }))).toBeNull(); // bad code alphabet
    expect(decodeResultHash(wire({ k: 1 }))).toBeNull(); // fewer tickets than entrants
    expect(decodeResultHash(wire({ w: [["Sam", 1, "1st"], ["Ava", 2, "2nd"]] }))).toBeNull(); // more winners than planned
    expect(decodeResultHash(wire({ m: "r" }))).toBeNull(); // range mode can't carry ticket #s
    expect(decodeResultHash(wire({ w: [["<b>".repeat(30), 1, ""]] }))).toBeNull(); // label too long
  });

  it("readResultHash only accepts #d=v1.", () => {
    expect(readResultHash("#d=v1.N4Ig")).toBe("#d=v1.N4Ig");
    expect(readResultHash("#r=abc")).toBeNull();
    expect(readResultHash("#d=v2.abc")).toBeNull();
  });
});
