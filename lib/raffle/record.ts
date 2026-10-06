// lib/raffle/record.ts
// The draw record the host can copy, download (.txt/.csv), print or share.
// It's a record for transparency, NOT a certified or audited draw.

import type { DuplicateMode, Entrant } from "./entries";
import type { RafflePick } from "./draw";

export const MAX_PRIZE_LABEL_LENGTH = 60;
export const MAX_TITLE_LENGTH = 60;

export interface RecordPick {
  label: string; // winner's name or ticket label
  ticket: number | null; // ticket # in list order (list mode); null in range mode (the label IS the ticket)
  prize?: string; // winners only
}

export interface DrawRecord {
  v: 1;
  code: string; // e.g. "K7F2Q9"
  createdAt: number; // ms since epoch, when the first pick was made
  tzOffsetMin: number; // minutes east of UTC on the host's device (-new Date().getTimezoneOffset())
  title?: string; // optional raffle name
  mode: "list" | "range";
  entrants: number; // people / labels in the draw
  tickets: number; // total tickets (chances)
  allowRepeatWinners: boolean;
  multipleTickets: boolean;
  duplicates: DuplicateMode;
  range?: { from: string; to: string; excluded: number };
  fingerprint: string; // list fingerprint, see listFingerprint()
  plannedWinners: number;
  plannedAlternates: number;
  winners: RecordPick[];
  alternates: RecordPick[];
}

/** 1 → "1st", 2 → "2nd", 11 → "11th", 22 → "22nd", 113 → "113th". */
export function ordinal(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  const suffix = ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th";
  return `${n}${suffix}`;
}

/** Prize for winner `position` (1-based): the host's line if given, otherwise "1st prize", "2nd prize"... */
export function prizeLabel(position: number, prizes: readonly string[]): string {
  const custom = (prizes[position - 1] ?? "").replace(/\s+/g, " ").trim().slice(0, MAX_PRIZE_LABEL_LENGTH);
  return custom || `${ordinal(position)} prize`;
}

/** Splits the optional Prizes textarea: one prize per line, in draw order. Blank lines keep their slot. */
export function parsePrizes(text: string): string[] {
  const lines = text.split(/\r\n|\n|\r/).map((l) => l.replace(/\s+/g, " ").trim());
  while (lines.length && !lines[lines.length - 1]) lines.pop();
  return lines.slice(0, 100);
}

export interface BuildRecordInput {
  code: string;
  createdAt: number;
  tzOffsetMin: number;
  title?: string;
  mode: "list" | "range";
  entrants: readonly Entrant[];
  picks: readonly RafflePick[];
  prizes: readonly string[];
  allowRepeatWinners: boolean;
  multipleTickets: boolean;
  duplicates: DuplicateMode;
  excluded?: number; // range mode: how many numbers were left out
  fingerprint: string;
  plannedWinners: number;
  plannedAlternates: number;
}

export function buildRecord(input: BuildRecordInput): DrawRecord {
  const { entrants, picks, mode } = input;
  const toPick = (p: RafflePick): RecordPick => ({
    label: entrants[p.entrant]!.label,
    ticket: mode === "list" ? p.ticket : null,
  });
  const title = (input.title ?? "").replace(/\s+/g, " ").trim().slice(0, MAX_TITLE_LENGTH);
  return {
    v: 1,
    code: input.code,
    createdAt: input.createdAt,
    tzOffsetMin: input.tzOffsetMin,
    ...(title ? { title } : {}),
    mode,
    entrants: entrants.length,
    tickets: entrants.reduce((s, e) => s + e.tickets, 0),
    allowRepeatWinners: input.allowRepeatWinners,
    multipleTickets: mode === "list" && input.multipleTickets,
    duplicates: input.duplicates,
    ...(mode === "range" && entrants.length
      ? { range: { from: entrants[0]!.label, to: entrants[entrants.length - 1]!.label, excluded: input.excluded ?? 0 } }
      : {}),
    fingerprint: input.fingerprint,
    plannedWinners: input.plannedWinners,
    plannedAlternates: input.plannedAlternates,
    winners: picks
      .filter((p) => p.kind === "winner")
      .map((p) => ({ ...toPick(p), prize: prizeLabel(p.position, input.prizes) })),
    alternates: picks.filter((p) => p.kind === "alternate").map(toPick),
  };
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/** "2026-10-06 14:32:05 (UTC+05:00)" in the host's own time zone. Deterministic for tests. */
export function formatTimestamp(createdAt: number, tzOffsetMin: number): string {
  const d = new Date(createdAt + tzOffsetMin * 60_000);
  const sign = tzOffsetMin >= 0 ? "+" : "-";
  const abs = Math.abs(tzOffsetMin);
  return (
    `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())} ` +
    `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}:${pad2(d.getUTCSeconds())} ` +
    `(UTC${sign}${pad2(Math.floor(abs / 60))}:${pad2(abs % 60)})`
  );
}

const fmt = (n: number) => n.toLocaleString("en-US");
const plural = (n: number, one: string, many: string) => `${fmt(n)} ${n === 1 ? one : many}`;

function pickLine(p: RecordPick): string {
  return p.ticket === null ? p.label : `${p.label} (ticket #${p.ticket})`;
}

export const RECORD_DISCLAIMER =
  "This record was made in the host's browser for transparency. It is not a certified or audited draw, and ExesTools does not store it.";

/** Plain-text record used by Copy record, Download (.txt) and Print. */
export function formatRecordText(r: DrawRecord): string {
  const lines: string[] = [];
  lines.push(r.title ? `Raffle draw record: ${r.title}` : "Raffle draw record");
  lines.push(`Draw code: ${r.code}`);
  lines.push(`Drawn: ${formatTimestamp(r.createdAt, r.tzOffsetMin)}`);
  if (r.mode === "range" && r.range) {
    const left = r.range.excluded ? ` (${plural(r.range.excluded, "number", "numbers")} left out)` : "";
    lines.push(`Tickets: ${r.range.from} to ${r.range.to}${left}, ${plural(r.tickets, "ticket", "tickets")} in the draw`);
  } else {
    lines.push(`Entries: ${plural(r.entrants, "name", "names")}, ${plural(r.tickets, "ticket", "tickets")}`);
  }
  lines.push(`List fingerprint: ${r.fingerprint}`);
  const rules =
    r.mode === "range"
      ? ["each ticket can win only once"]
      : [r.allowRepeatWinners ? "a person can win more than once (one prize per ticket)" : "each person can win only once"];
  if (r.mode === "list") {
    if (r.multipleTickets) rules.push("multiple tickets per person on");
    rules.push(r.duplicates === "combine" ? "repeated names combined into extra tickets" : "repeated names ignored");
  }
  lines.push(`Rules: ${rules.join("; ")}`);
  lines.push("");
  const progress = r.winners.length < r.plannedWinners ? ` (${r.winners.length} of ${r.plannedWinners} drawn so far)` : "";
  lines.push(`Winners, in draw order${progress}:`);
  r.winners.forEach((w, i) => lines.push(`${i + 1}. ${w.prize}: ${pickLine(w)}`));
  if (r.alternates.length) {
    lines.push("");
    lines.push("Alternates, in order (if a winner can't be reached or declines):");
    r.alternates.forEach((a, i) => lines.push(`${i + 1}. ${pickLine(a)}`));
  }
  lines.push("");
  lines.push("Made with the ExesTools raffle generator: https://www.exestools.com/raffle-generator");
  lines.push(RECORD_DISCLAIMER);
  return lines.join("\n");
}

/** Escapes a CSV cell and blocks spreadsheet formula injection (=, +, -, @, tab, CR). */
export function csvCell(value: string | number): string {
  let s = String(value);
  if (typeof value === "string" && /^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** CSV used by Download (.csv). One row per pick. */
export function recordCsv(r: DrawRecord): string {
  const rows: (string | number)[][] = [["Type", "Position", "Prize", "Name or ticket", "Ticket number"]];
  r.winners.forEach((w, i) => rows.push(["Winner", i + 1, w.prize ?? "", w.label, w.ticket ?? ""]));
  r.alternates.forEach((a, i) => rows.push(["Alternate", i + 1, "", a.label, a.ticket ?? ""]));
  return rows.map((row) => row.map(csvCell).join(",")).join("\r\n") + "\r\n";
}

/** File names include the draw code: raffle-draw-K7F2Q9.txt / .csv */
export const recordFileName = (r: DrawRecord, ext: "txt" | "csv") => `raffle-draw-${r.code}.${ext}`;

/**
 * List fingerprint: the first 64 bits of SHA-256 over the final entry list (label + ticket count,
 * in order), shown as "3F9A-12C0-77B1-0D4E". If the host publishes the list before the draw,
 * anyone can paste the same list into the tool and see the same fingerprint. It shows the list
 * wasn't changed; it does NOT prove how the winners were picked.
 */
export async function listFingerprint(entrants: readonly Pick<Entrant, "label" | "tickets">[]): Promise<string> {
  const canonical = entrants.map((e) => `${e.label}\t${e.tickets}`).join("\n");
  const digest = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonical));
  const hex = Array.from(new Uint8Array(digest).slice(0, 8), (b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
  return hex.match(/.{4}/g)!.join("-");
}
