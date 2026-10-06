// lib/raffle/messages.ts
// Exact UI copy for list summaries, warnings and draw errors.

import { MAX_LABEL_LENGTH, MAX_TICKETS, MAX_RANGE_NUMBER, type EntryIssue, type ParseResult, type RangeErrorKind } from "./entries";
import { MAX_ALTERNATES, MAX_WINNERS, type DrawResult } from "./draw";

const fmt = (n: number) => n.toLocaleString("en-US");
const plural = (n: number, one: string, many: string) => `${fmt(n)} ${n === 1 ? one : many}`;

/** Live line under the list, e.g. "48 names · 120 tickets". */
export function listSummary(p: Pick<ParseResult, "entrants" | "totalTickets">): string {
  if (p.entrants.length === 0) return "No entries yet.";
  return `${plural(p.entrants.length, "name", "names")} · ${plural(p.totalTickets, "ticket", "tickets")}`;
}

/** Live line in range mode, e.g. "488 tickets: A-001 to A-500 (12 left out)". */
export function rangeSummary(count: number, from: string, to: string, excluded: number): string {
  const left = excluded ? ` (${fmt(excluded)} left out)` : "";
  return `${plural(count, "ticket", "tickets")}: ${from} to ${to}${left}`;
}

/** Warning box shown whenever a list has repeated names. Null when there are none. */
export function duplicateNotice(p: Pick<ParseResult, "duplicateLines" | "duplicateNames">, mode: "combine" | "dedupe"): string | null {
  if (p.duplicateLines === 0) return null;
  const names = plural(p.duplicateNames, "name appears", "names appear");
  return mode === "combine"
    ? `${names} more than once, so each extra line counts as an extra ticket. Choose One entry per name if everyone should have one chance.`
    : `${names} more than once. Ignored ${plural(p.duplicateLines, "repeated line", "repeated lines")}, so each name has one entry.`;
}

export function countHint(p: Pick<ParseResult, "countLikeLines">, multipleTickets: boolean): string | null {
  if (multipleTickets || p.countLikeLines === 0) return null;
  return "Some lines end in a number, like Sam x3 or a second column. If those are ticket counts, turn on Multiple tickets per person.";
}

export function overLimitMessage(totalTickets: number): string {
  return `This list has ${fmt(totalTickets)} tickets. The raffle generator draws from up to ${fmt(MAX_TICKETS)} tickets at a time.`;
}

/** One message per problem line. Drawing stays disabled until every line reads cleanly. */
export function issueMessage(issue: EntryIssue): string {
  const quoted = issue.text.length > 30 ? `"${issue.text.slice(0, 29)}…"` : `"${issue.text}"`;
  switch (issue.kind) {
    case "bad_count":
      return `Line ${issue.line}: ${quoted}. Ticket counts must be whole numbers from 1 to ${fmt(MAX_TICKETS)}, like Sam x3.`;
    case "count_too_big":
      return `Line ${issue.line}: ${quoted}. One line can have at most ${fmt(MAX_TICKETS)} tickets.`;
    case "missing_label":
      return `Line ${issue.line}: ${quoted}. Add a name before the ticket count.`;
    case "label_too_long":
      return `Line ${issue.line} is over ${MAX_LABEL_LENGTH} characters. Shorten it to include it in the draw.`;
  }
}

export function rangeErrorMessage(kind: RangeErrorKind): string {
  switch (kind) {
    case "not_whole":
      return "Enter whole numbers of 0 or more for the first and last ticket.";
    case "start_after_end":
      return "The first ticket number must be lower than the last one.";
    case "too_large":
      return `Ticket numbers can go up to ${fmt(MAX_RANGE_NUMBER)}.`;
    case "too_many":
      return `A range can include up to ${fmt(MAX_TICKETS)} tickets. Split bigger raffles into separate draws.`;
    case "prefix_too_long":
      return "Keep the prefix to 10 characters or fewer.";
    case "nothing_left":
      return "Every number in this range is left out. Remove some numbers from Leave out.";
  }
}

export function invalidExcludesMessage(tokens: readonly string[]): string | null {
  if (tokens.length === 0) return null;
  const shown = tokens.slice(0, 5).join(", ") + (tokens.length > 5 ? ", …" : "");
  return `Couldn't use these left-out numbers: ${shown}. Use numbers inside your range, like 37 or 112-120.`;
}

/** Turns a failed DrawResult into the exact UI message (role="alert"). */
export function describeDrawFailure(res: Extract<DrawResult, { ok: false }>, allowRepeatWinners: boolean): string {
  switch (res.reason) {
    case "no_entries":
      return "Add at least one name or ticket to draw.";
    case "too_many_tickets":
      return overLimitMessage(res.requested ?? MAX_TICKETS + 1);
    case "bad_count":
      return `Choose 1 to ${MAX_WINNERS} winners and 0 to ${MAX_ALTERNATES} alternates.`;
    case "not_enough_entries": {
      const what = allowRepeatWinners ? plural(res.available ?? 0, "ticket", "tickets") : plural(res.available ?? 0, "entry", "entries");
      return `You asked for ${fmt(res.requested ?? 0)} winners and alternates, but there ${res.available === 1 ? "is" : "are"} only ${what} to draw from. Lower the numbers or add entries.`;
    }
  }
}
