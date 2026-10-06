// lib/raffle/messages.test.ts
import { describe, expect, it } from "vitest";
import { countHint, describeDrawFailure, duplicateNotice, invalidExcludesMessage, issueMessage, listSummary, rangeErrorMessage, rangeSummary } from "./messages";
import { parseEntries } from "./entries";
import { drawRaffle } from "./draw";

describe("messages", () => {
  it("summaries", () => {
    expect(listSummary(parseEntries(""))).toBe("No entries yet.");
    expect(listSummary(parseEntries("Sam x3\nAva", { multipleTickets: true }))).toBe("2 names · 4 tickets");
    expect(listSummary(parseEntries("Sam"))).toBe("1 name · 1 ticket");
    expect(rangeSummary(488, "A-001", "A-500", 12)).toBe("488 tickets: A-001 to A-500 (12 left out)");
    expect(rangeSummary(10000, "1", "10000", 0)).toBe("10,000 tickets: 1 to 10000");
  });

  it("duplicate notices for both modes", () => {
    const p = parseEntries("Sam\nsam\nAva\nAva\nAva");
    expect(duplicateNotice(p, "combine")).toBe(
      "2 names appear more than once, so each extra line counts as an extra ticket. Choose One entry per name if everyone should have one chance.",
    );
    expect(duplicateNotice(parseEntries("Sam\nsam", { duplicates: "dedupe" }), "dedupe")).toBe(
      "1 name appears more than once. Ignored 1 repeated line, so each name has one entry.",
    );
    expect(duplicateNotice(parseEntries("Sam\nAva"), "combine")).toBeNull();
  });

  it("count hint only when the switch is off", () => {
    expect(countHint(parseEntries("Sam x3"), false)).toMatch(/^Some lines end in a number/);
    expect(countHint(parseEntries("Sam x3", { multipleTickets: true }), true)).toBeNull();
  });

  it("issue messages name the line", () => {
    const [issue] = parseEntries("Sam\nAva x2.5", { multipleTickets: true }).issues;
    expect(issueMessage(issue)).toBe('Line 2: "Ava x2.5". Ticket counts must be whole numbers from 1 to 10,000, like Sam x3.');
    expect(issueMessage({ line: 9, kind: "label_too_long", text: "x".repeat(70) })).toBe(
      "Line 9 is over 60 characters. Shorten it to include it in the draw.",
    );
  });

  it("range and exclude messages", () => {
    expect(rangeErrorMessage("too_many")).toBe("A range can include up to 10,000 tickets. Split bigger raffles into separate draws.");
    expect(invalidExcludesMessage(["99", "abc"])).toBe("Couldn't use these left-out numbers: 99, abc. Use numbers inside your range, like 37 or 112-120.");
    expect(invalidExcludesMessage([])).toBeNull();
  });

  it("draw failures", () => {
    const res = drawRaffle([{ tickets: 3 }, { tickets: 1 }], { winners: 2, alternates: 1 });
    if (res.ok) throw new Error("expected failure");
    expect(describeDrawFailure(res, false)).toBe(
      "You asked for 3 winners and alternates, but there are only 2 entries to draw from. Lower the numbers or add entries.",
    );
    const empty = drawRaffle([], { winners: 1 });
    if (empty.ok) throw new Error("expected failure");
    expect(describeDrawFailure(empty, false)).toBe("Add at least one name or ticket to draw.");
  });
});
