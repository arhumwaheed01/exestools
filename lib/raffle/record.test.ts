// lib/raffle/record.test.ts
import { describe, expect, it } from "vitest";
import { buildRecord, csvCell, formatRecordText, formatTimestamp, listFingerprint, ordinal, parsePrizes, prizeLabel, recordCsv, recordFileName } from "./record";
import { buildRange, parseEntries } from "./entries";
import type { RafflePick } from "./draw";

const AT = Date.UTC(2026, 9, 6, 9, 32, 5); // 2026-10-06 09:32:05 UTC

describe("labels", () => {
  it("ordinals", () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22, 23, 101, 111, 112].map(ordinal)).toEqual(
      ["1st", "2nd", "3rd", "4th", "11th", "12th", "13th", "21st", "22nd", "23rd", "101st", "111th", "112th"],
    );
  });
  it("uses the host's prize lines, then falls back to 1st/2nd prize", () => {
    const prizes = parsePrizes("Gift basket\n\nCinema tickets\n\n");
    expect(prizes).toEqual(["Gift basket", "", "Cinema tickets"]);
    expect([1, 2, 3, 4].map((p) => prizeLabel(p, prizes))).toEqual(["Gift basket", "2nd prize", "Cinema tickets", "4th prize"]);
  });
  it("formats the time in the host's zone", () => {
    expect(formatTimestamp(AT, 300)).toBe("2026-10-06 14:32:05 (UTC+05:00)");
    expect(formatTimestamp(AT, -420)).toBe("2026-10-06 02:32:05 (UTC-07:00)");
    expect(formatTimestamp(AT, 330)).toBe("2026-10-06 15:02:05 (UTC+05:30)");
  });
});

describe("record text and CSV", () => {
  const parsed = parseEntries("Sam x3\nAva\nBen x2\nCal", { multipleTickets: true });
  const picks: RafflePick[] = [
    { kind: "winner", position: 1, entrant: 2, ticket: 6 },
    { kind: "winner", position: 2, entrant: 0, ticket: 2 },
    { kind: "alternate", position: 1, entrant: 3, ticket: 7 },
  ];
  const record = buildRecord({
    code: "K7F2Q9", createdAt: AT, tzOffsetMin: 300, title: "  Spring   Fair ",
    mode: "list", entrants: parsed.entrants, picks, prizes: ["Gift basket"],
    allowRepeatWinners: false, multipleTickets: true, duplicates: "combine",
    fingerprint: "3F9A-12C0-77B1-0D4E", plannedWinners: 2, plannedAlternates: 1,
  });

  it("builds a self-contained record", () => {
    expect(record).toMatchObject({
      title: "Spring Fair", entrants: 4, tickets: 7,
      winners: [{ label: "Ben", ticket: 6, prize: "Gift basket" }, { label: "Sam", ticket: 2, prize: "2nd prize" }],
      alternates: [{ label: "Cal", ticket: 7 }],
    });
  });

  it("formats the exact copy/download text", () => {
    expect(formatRecordText(record)).toBe(
      [
        "Raffle draw record: Spring Fair",
        "Draw code: K7F2Q9",
        "Drawn: 2026-10-06 14:32:05 (UTC+05:00)",
        "Entries: 4 names, 7 tickets",
        "List fingerprint: 3F9A-12C0-77B1-0D4E",
        "Rules: each person can win only once; multiple tickets per person on; repeated names combined into extra tickets",
        "",
        "Winners, in draw order:",
        "1. Gift basket: Ben (ticket #6)",
        "2. 2nd prize: Sam (ticket #2)",
        "",
        "Alternates, in order (if a winner can't be reached or declines):",
        "1. Cal (ticket #7)",
        "",
        "Made with the ExesTools raffle generator: https://www.exestools.com/raffle-generator",
        "This record was made in the host's browser for transparency. It is not a certified or audited draw, and ExesTools does not store it.",
      ].join("\n"),
    );
  });

  it("shows progress during a one-at-a-time draw", () => {
    const partial = { ...record, plannedWinners: 5 };
    expect(formatRecordText(partial)).toContain("Winners, in draw order (2 of 5 drawn so far):");
  });

  it("range records show the range, not ticket #s", () => {
    const range = buildRange({ start: 1, end: 500, prefix: "A-", pad: true, excludeText: "13" });
    if (!range.ok) throw new Error("range");
    const r = buildRecord({
      code: "ABCDEF", createdAt: AT, tzOffsetMin: 0, mode: "range", entrants: range.entrants,
      picks: [{ kind: "winner", position: 1, entrant: 76, ticket: 77 }], prizes: [],
      allowRepeatWinners: false, multipleTickets: false, duplicates: "combine", excluded: range.excluded,
      fingerprint: "0000-0000-0000-0000", plannedWinners: 1, plannedAlternates: 0,
    });
    const text = formatRecordText(r);
    expect(text).toContain("Tickets: A-001 to A-500 (1 number left out), 499 tickets in the draw");
    expect(text).toContain("1. 1st prize: A-078");
    expect(text).not.toContain("ticket #");
    expect(text).toContain("Rules: each ticket can win only once\n");
  });

  it("CSV escapes quotes/commas and blocks formula injection", () => {
    expect(csvCell('Ann "AJ" Lee, Jr')).toBe('"Ann ""AJ"" Lee, Jr"');
    expect(csvCell("=HYPERLINK(1)")).toBe("'=HYPERLINK(1)");
    expect(csvCell("@cmd")).toBe("'@cmd");
    expect(csvCell(-5)).toBe("-5");
    expect(recordCsv(record)).toBe(
      "Type,Position,Prize,Name or ticket,Ticket number\r\n" +
        "Winner,1,Gift basket,Ben,6\r\n" +
        "Winner,2,2nd prize,Sam,2\r\n" +
        "Alternate,1,,Cal,7\r\n",
    );
    expect(recordFileName(record, "csv")).toBe("raffle-draw-K7F2Q9.csv");
  });
});

describe("listFingerprint", () => {
  it("is stable, formatted, and changes when the list or a count changes", async () => {
    const a = await listFingerprint([{ label: "Sam", tickets: 3 }, { label: "Ava", tickets: 1 }]);
    const again = await listFingerprint([{ label: "Sam", tickets: 3 }, { label: "Ava", tickets: 1 }]);
    const count = await listFingerprint([{ label: "Sam", tickets: 2 }, { label: "Ava", tickets: 1 }]);
    const order = await listFingerprint([{ label: "Ava", tickets: 1 }, { label: "Sam", tickets: 3 }]);
    expect(a).toMatch(/^[0-9A-F]{4}(-[0-9A-F]{4}){3}$/);
    expect(again).toBe(a);
    expect(count).not.toBe(a);
    expect(order).not.toBe(a); // order sets ticket numbers, so it's part of the list
  });

  it("matches a known SHA-256 prefix", async () => {
    // sha256("Sam\t1") = bfe48556f04a4e5faf24f6f5598d421eeaa69518d1f600ad7d821f059258e1e2
    expect(await listFingerprint([{ label: "Sam", tickets: 1 }])).toBe("BFE4-8556-F04A-4E5F");
  });

  it("same names typed differently give the same fingerprint after parsing", async () => {
    const x = parseEntries("Sam\n  sam \nAva", {}).entrants;
    const y = parseEntries("Sam x2\nAva", { multipleTickets: true }).entrants;
    expect(await listFingerprint(x)).toBe(await listFingerprint(y));
  });
});
