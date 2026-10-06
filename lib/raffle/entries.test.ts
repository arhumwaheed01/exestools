// lib/raffle/entries.test.ts
import { describe, expect, it } from "vitest";
import { buildRange, parseEntries, parseExcludeList, parseLine, MAX_TICKETS } from "./entries";

describe("parseLine with multiple tickets on", () => {
  it.each([
    ["Sam x3", "Sam", 3],
    ["Sam X 3", "Sam", 3],
    ["Sam ×3", "Sam", 3],
    ["Sam×3", "Sam", 3],
    ["Sam *3", "Sam", 3],
    ["Sam*3", "Sam", 3],
    ["Sam\t3", "Sam", 3],
    ["Sam K.\t\t12", "Sam K.", 12],
    ["Smith, John x2", "Smith, John", 2],
    ["Ticket 4 x2", "Ticket 4", 2],
    ["Max3", "Max3", 1], // no space before x → part of the name
    ["Rex 3", "Rex 3", 1], // a plain trailing number is part of the name
    ["Sam", "Sam", 1],
  ])("%s → %s × %i", (line, label, tickets) => {
    expect(parseLine(line, true)).toEqual({ label, tickets });
  });

  it("reports bad counts instead of guessing", () => {
    expect(parseLine("Sam x0", true).issue).toBe("bad_count");
    expect(parseLine("Sam x2.5", true).issue).toBe("bad_count");
    expect(parseLine("Sam x-2", true).issue).toBe("bad_count");
    expect(parseLine("Sam x1,000", true).issue).toBe("bad_count");
    expect(parseLine(`Sam x${MAX_TICKETS + 1}`, true).issue).toBe("count_too_big");
    expect(parseLine("*3", true).issue).toBe("missing_label");
    expect(parseLine("y".repeat(61), true).issue).toBe("label_too_long");
  });

  it("never reads counts when multiple tickets is off", () => {
    expect(parseLine("Sam x3", false)).toEqual({ label: "Sam x3", tickets: 1 });
    expect(parseLine("Sam\t3", false)).toEqual({ label: "Sam 3", tickets: 1 });
  });
});

describe("parseEntries", () => {
  it("trims, collapses spaces and skips blank lines", () => {
    const r = parseEntries("  Sam  \n\n Ava   Lee \r\n\t\nBen\n");
    expect(r.entrants.map((e) => e.label)).toEqual(["Sam", "Ava Lee", "Ben"]);
    expect(r.entrants.map((e) => e.line)).toEqual([1, 3, 5]);
    expect(r.totalTickets).toBe(3);
  });

  it("combines repeated names into extra tickets by default (case-insensitive)", () => {
    const r = parseEntries("Sam\nAva\nsam\nSAM \nAva");
    expect(r.entrants).toEqual([
      { label: "Sam", tickets: 3, line: 1 },
      { label: "Ava", tickets: 2, line: 2 },
    ]);
    expect(r.totalTickets).toBe(5);
    expect(r.duplicateLines).toBe(3);
    expect(r.duplicateNames).toBe(2);
  });

  it("dedupe mode keeps one entry per name (first line wins)", () => {
    const r = parseEntries("Sam x2\nAva\nsam x5", { duplicates: "dedupe", multipleTickets: true });
    expect(r.entrants).toEqual([
      { label: "Sam", tickets: 2, line: 1 },
      { label: "Ava", tickets: 1, line: 2 },
    ]);
    expect(r.duplicateLines).toBe(1);
  });

  it("adds counts for repeated names with multiple tickets on", () => {
    const r = parseEntries("Sam x2\nAva\nSam x3", { multipleTickets: true });
    expect(r.entrants[0]).toEqual({ label: "Sam", tickets: 5, line: 1 });
    expect(r.totalTickets).toBe(6);
  });

  it("hints when lines look like counts but the switch is off", () => {
    expect(parseEntries("Sam x3\nAva\nBen\t2").countLikeLines).toBe(2);
    expect(parseEntries("Sam x3", { multipleTickets: true }).countLikeLines).toBe(0);
  });

  it("collects issues with line numbers and leaves those lines out", () => {
    const r = parseEntries("Sam x2\n\nAva x2.5\nx3\n*4", { multipleTickets: true });
    expect(r.entrants.map((e) => e.label)).toEqual(["Sam", "x3"]);
    expect(r.issues).toEqual([
      { line: 3, kind: "bad_count", text: "Ava x2.5" },
      { line: 5, kind: "missing_label", text: "*4" },
    ]);
  });

  it("flags lists over 10,000 tickets instead of truncating them", () => {
    const r = parseEntries("Big x9999\nSmall x2", { multipleTickets: true });
    expect(r.totalTickets).toBe(10_001);
    expect(r.overLimit).toBe(true);
    expect(parseEntries("Big x9999\nSmall", { multipleTickets: true }).overLimit).toBe(false);
  });

  it("parses 10,000 lines quickly", () => {
    const text = Array.from({ length: 10_000 }, (_, i) => `Person ${i + 1}`).join("\n");
    const t0 = performance.now();
    const r = parseEntries(text);
    const ms = performance.now() - t0;
    expect(r.entrants).toHaveLength(10_000);
    expect(r.overLimit).toBe(false);
    expect(ms).toBeLessThan(250);
  });
});

describe("number ranges", () => {
  it("builds a padded, prefixed range", () => {
    const r = buildRange({ start: 1, end: 500, prefix: "A-", pad: true });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.entrants).toHaveLength(500);
    expect(r.entrants[0]).toEqual({ label: "A-001", tickets: 1, line: 0 });
    expect(r.entrants[499].label).toBe("A-500");
  });

  it("leaves out unsold or void tickets", () => {
    const r = buildRange({ start: 1, end: 20, excludeText: "3, 10-12 20 ; 99 abc 15-14" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.entrants.map((e) => e.label)).not.toContain("11");
    expect(r.entrants).toHaveLength(15);
    expect(r.excluded).toBe(5);
    expect(r.invalidExcludes).toEqual(["99", "abc", "15-14"]);
  });

  it("parseExcludeList accepts en dashes", () => {
    expect([...parseExcludeList("5–7", 1, 10).numbers]).toEqual([5, 6, 7]);
  });

  it("validates ranges", () => {
    expect(buildRange({ start: 5, end: 1 })).toEqual({ ok: false, error: "start_after_end" });
    expect(buildRange({ start: 1.5, end: 3 })).toEqual({ ok: false, error: "not_whole" });
    expect(buildRange({ start: -1, end: 3 })).toEqual({ ok: false, error: "not_whole" });
    expect(buildRange({ start: 1, end: 10_001 })).toEqual({ ok: false, error: "too_many" });
    expect(buildRange({ start: 9_999_990, end: 10_000_000 })).toEqual({ ok: false, error: "too_large" });
    expect(buildRange({ start: 1, end: 3, prefix: "TOO-LONG-PREFIX" })).toEqual({ ok: false, error: "prefix_too_long" });
    expect(buildRange({ start: 1, end: 3, excludeText: "1-3" })).toEqual({ ok: false, error: "nothing_left" });
    expect(buildRange({ start: 1, end: 10_000 }).ok).toBe(true);
    expect(buildRange({ start: 0, end: 0 }).ok).toBe(true);
  });
});
