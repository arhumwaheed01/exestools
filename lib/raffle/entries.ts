// lib/raffle/entries.ts
// Turns pasted text or a ticket-number range into a list of entrants with ticket counts.
// Pure functions, no DOM, no network.

export const MAX_TICKETS = 10_000; // total tickets in one draw (after counts and duplicates)
export const MAX_LABEL_LENGTH = 60; // characters per name or ticket label
export const MAX_RANGE_NUMBER = 9_999_999;
export const MAX_PREFIX_LENGTH = 10;

export interface Entrant {
  /** Name or ticket label as the host typed it (first spelling wins when merged). */
  label: string;
  /** Number of tickets (chances) this entrant holds. Always >= 1. */
  tickets: number;
  /** 1-based line number of the first line that produced this entrant (0 for ranges). */
  line: number;
}

/** "combine": repeated names become one entrant with the tickets added up (default).
 *  "dedupe":  repeated names are ignored; the first line counts. */
export type DuplicateMode = "combine" | "dedupe";

export interface ParseOptions {
  /** Read ticket counts like "Sam x3", "Sam *3", "Sam ×3" or a count column (tab). Off by default. */
  multipleTickets?: boolean;
  duplicates?: DuplicateMode;
}

export type EntryIssueKind =
  | "bad_count" // not a whole number, or below 1
  | "count_too_big" // more than MAX_TICKETS on one line
  | "missing_label" // a count with no name, e.g. "x3"
  | "label_too_long"; // over MAX_LABEL_LENGTH

export interface EntryIssue {
  line: number; // 1-based
  kind: EntryIssueKind;
  text: string; // the trimmed line, for the message
}

export interface ParseResult {
  entrants: Entrant[];
  totalTickets: number;
  issues: EntryIssue[];
  /** Lines folded into an earlier entrant (combine) or ignored (dedupe). */
  duplicateLines: number;
  /** Distinct names that appeared more than once. */
  duplicateNames: number;
  /** Lines that look like they carry a count while multipleTickets is off (UI hint). */
  countLikeLines: number;
  /** True when totalTickets > MAX_TICKETS. The draw must be blocked, never truncated. */
  overLimit: boolean;
}

/** Trim and collapse inner whitespace (tabs included). */
export const normalizeLabel = (raw: string) => raw.replace(/\s+/g, " ").trim();

/** Case-insensitive key: "Sam", "sam " and "SAM" are the same entrant. */
export const labelKey = (label: string) => normalizeLabel(label).toLocaleLowerCase("en");

// "Sam x3", "Sam x 3", "Sam X3", "Sam *3", "Sam*3", "Sam ×3". An "x" needs a space before it,
// so "Max3" or "Rex 3" are never read as counts. The count token is loose on purpose
// (decimals, signs) so bad counts are reported instead of silently becoming part of the name.
const COUNT_SUFFIX = /^(.*?)(?:\s+[xX×]\s*|\s*[*×]\s*)([-+]?\d+(?:[.,]\d+)*)$/;
const COUNT_CELL = /^[-+]?\d+(?:[.,]\d+)*$/;

interface LineParse {
  label: string;
  tickets: number;
  issue?: EntryIssueKind;
}

/** Parses one non-blank line. Exported for tests. */
export function parseLine(rawLine: string, multipleTickets: boolean): LineParse {
  if (!multipleTickets) {
    const label = normalizeLabel(rawLine);
    if (label.length > MAX_LABEL_LENGTH) return { label, tickets: 0, issue: "label_too_long" };
    return { label, tickets: 1 };
  }

  let labelPart = rawLine;
  let countToken: string | null = null;

  const cells = rawLine.split("\t").map((c) => c.trim()).filter(Boolean);
  if (rawLine.includes("\t") && cells.length >= 2 && COUNT_CELL.test(cells[cells.length - 1])) {
    labelPart = cells.slice(0, -1).join(" ");
    countToken = cells[cells.length - 1];
  } else {
    const m = COUNT_SUFFIX.exec(normalizeLabel(rawLine));
    if (m) {
      labelPart = m[1];
      countToken = m[2];
    }
  }

  const label = normalizeLabel(labelPart);
  if (countToken !== null && !label) return { label, tickets: 0, issue: "missing_label" };
  if (label.length > MAX_LABEL_LENGTH) return { label, tickets: 0, issue: "label_too_long" };
  if (countToken === null) return { label, tickets: 1 };
  if (!/^\+?\d+$/.test(countToken)) return { label, tickets: 0, issue: "bad_count" };
  const tickets = Number(countToken.replace("+", ""));
  if (tickets < 1) return { label, tickets: 0, issue: "bad_count" };
  if (tickets > MAX_TICKETS) return { label, tickets: 0, issue: "count_too_big" };
  return { label, tickets };
}

/** Parses the entries textarea. One entrant per line; blank lines are ignored. */
export function parseEntries(text: string, options: ParseOptions = {}): ParseResult {
  const { multipleTickets = false, duplicates = "combine" } = options;
  const entrants: Entrant[] = [];
  const indexByKey = new Map<string, number>();
  const seenTwice = new Set<string>();
  const issues: EntryIssue[] = [];
  let duplicateLines = 0;
  let countLikeLines = 0;
  let totalTickets = 0;

  const lines = text.split(/\r\n|\n|\r/);
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (!raw.trim()) continue;
    const lineNo = i + 1;
    if (!multipleTickets && (raw.includes("\t") || COUNT_SUFFIX.test(normalizeLabel(raw)))) {
      if (parseLine(raw, true).tickets > 1) countLikeLines++;
    }
    const parsed = parseLine(raw, multipleTickets);
    if (parsed.issue) {
      issues.push({ line: lineNo, kind: parsed.issue, text: normalizeLabel(raw) });
      continue;
    }
    const key = labelKey(parsed.label);
    const existing = indexByKey.get(key);
    if (existing === undefined) {
      indexByKey.set(key, entrants.length);
      entrants.push({ label: parsed.label, tickets: parsed.tickets, line: lineNo });
      totalTickets += parsed.tickets;
    } else {
      duplicateLines++;
      seenTwice.add(key);
      if (duplicates === "combine") {
        entrants[existing]!.tickets += parsed.tickets;
        totalTickets += parsed.tickets;
      }
    }
  }

  return {
    entrants,
    totalTickets,
    issues,
    duplicateLines,
    duplicateNames: seenTwice.size,
    countLikeLines,
    overLimit: totalTickets > MAX_TICKETS,
  };
}

// ---------------------------------------------------------------------------
// Number range mode
// ---------------------------------------------------------------------------

export interface RangeInput {
  start: number;
  end: number;
  prefix?: string; // e.g. "A-" → A-001
  pad?: boolean; // zero-pad to the width of `end`
  /** Unsold or void tickets to leave out, e.g. "37, 112-120". */
  excludeText?: string;
}

export type RangeErrorKind =
  | "not_whole" // start or end missing, decimal or negative
  | "start_after_end"
  | "too_large" // above MAX_RANGE_NUMBER
  | "too_many" // more than MAX_TICKETS numbers in the range
  | "prefix_too_long"
  | "nothing_left"; // every number was left out

export interface ExcludeParse {
  numbers: Set<number>;
  /** Tokens that couldn't be read or fall outside the range. Shown to the host, never guessed. */
  invalid: string[];
}

/** Reads "37, 112-120 450" into a set. Separators: commas, semicolons, spaces, new lines. */
export function parseExcludeList(text: string, start: number, end: number): ExcludeParse {
  const numbers = new Set<number>();
  const invalid: string[] = [];
  for (const token of text.split(/[\s,;]+/).filter(Boolean)) {
    const m = /^(\d+)(?:\s*[-–]\s*(\d+))?$/.exec(token);
    if (!m) {
      invalid.push(token);
      continue;
    }
    const a = Number(m[1]);
    const b = m[2] === undefined ? a : Number(m[2]);
    if (a > b || a < start || b > end) {
      invalid.push(token);
      continue;
    }
    for (let n = a; n <= b; n++) numbers.add(n);
  }
  return { numbers, invalid };
}

export type RangeResult =
  | { ok: true; entrants: Entrant[]; excluded: number; invalidExcludes: string[] }
  | { ok: false; error: RangeErrorKind };

/** Builds one entrant (one ticket) per number in the range, minus left-out numbers. */
export function buildRange(input: RangeInput): RangeResult {
  const { start, end, prefix = "", pad = false, excludeText = "" } = input;
  if (![start, end].every((n) => Number.isInteger(n) && n >= 0)) return { ok: false, error: "not_whole" };
  if (start > end) return { ok: false, error: "start_after_end" };
  if (end > MAX_RANGE_NUMBER) return { ok: false, error: "too_large" };
  if (end - start + 1 > MAX_TICKETS) return { ok: false, error: "too_many" };
  const cleanPrefix = normalizeLabel(prefix);
  if (cleanPrefix.length > MAX_PREFIX_LENGTH) return { ok: false, error: "prefix_too_long" };

  const { numbers: excluded, invalid } = parseExcludeList(excludeText, start, end);
  const width = pad ? String(end).length : 0;
  const entrants: Entrant[] = [];
  for (let n = start; n <= end; n++) {
    if (excluded.has(n)) continue;
    entrants.push({ label: cleanPrefix + String(n).padStart(width, "0"), tickets: 1, line: 0 });
  }
  if (entrants.length === 0) return { ok: false, error: "nothing_left" };
  return { ok: true, entrants, excluded: excluded.size, invalidExcludes: invalid };
}
