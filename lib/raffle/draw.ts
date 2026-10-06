// lib/raffle/draw.ts
// Ticket-based raffle draw: every remaining ticket has the same chance on every pick.
// Pure functions, no DOM, no network.

import { secureRandomInt, type RandomInt } from "./random";
import { MAX_TICKETS } from "./entries";

export const MAX_WINNERS = 100;
export const MAX_ALTERNATES = 20;

export interface TicketHolder {
  tickets: number;
}

export interface DrawOptions {
  winners: number;
  alternates?: number;
  /** false (default): once someone wins, all their tickets leave the draw.
   *  true: only the winning ticket leaves, so a person with several tickets can win again. */
  allowRepeatWinners?: boolean;
  /** Injected RNG for tests. Defaults to crypto-backed secureRandomInt. */
  randomInt?: RandomInt;
}

export interface RafflePick {
  kind: "winner" | "alternate";
  /** 1-based position within its kind: winner 1 = first prize, alternate 1 = first backup. */
  position: number;
  /** Index into the entrants array. */
  entrant: number;
  /** 1-based ticket number in list order (entrant 0 holds 1..t0, entrant 1 starts at t0+1, ...). */
  ticket: number;
}

export type DrawFailureReason =
  | "no_entries"
  | "too_many_tickets" // more than MAX_TICKETS
  | "bad_count" // winners < 1, winners > MAX_WINNERS, alternates < 0 or > MAX_ALTERNATES
  | "not_enough_entries"; // asked for more picks than people (or tickets) available

export type DrawResult =
  | { ok: true; picks: RafflePick[] }
  | { ok: false; reason: DrawFailureReason; available?: number; requested?: number };

/**
 * Remaining tickets per entrant, in a Fenwick (binary indexed) tree so we can find
 * "the k-th remaining ticket" in O(log n) even with 10,000 entrants.
 */
class TicketPool {
  private readonly tree: Float64Array;
  private readonly remaining: number[];
  private readonly drawnOffsets: number[][];
  readonly starts: number[]; // 0-based global index of each entrant's first ticket
  total = 0;

  constructor(holders: readonly TicketHolder[]) {
    const n = holders.length;
    this.tree = new Float64Array(n + 1);
    this.remaining = holders.map((h) => h.tickets);
    this.drawnOffsets = holders.map(() => []);
    this.starts = new Array<number>(n);
    let acc = 0;
    for (let i = 0; i < n; i++) {
      this.starts[i] = acc;
      acc += holders[i]!.tickets;
      this.tree[i + 1]! += holders[i]!.tickets;
      const parent = i + 1 + ((i + 1) & -(i + 1));
      if (parent <= n) this.tree[parent]! += this.tree[i + 1]!;
    }
    this.total = acc;
  }

  private add(index: number, delta: number) {
    for (let i = index + 1; i < this.tree.length; i += i & -i) this.tree[i]! += delta;
    this.total += delta;
  }

  /** Entrant holding the k-th remaining ticket (0-based k), and k's offset inside that entrant. */
  private find(k: number): { entrant: number; within: number } {
    let pos = 0;
    let rest = k;
    let step = 1;
    while (step * 2 < this.tree.length) step *= 2;
    for (; step > 0; step >>= 1) {
      const next = pos + step;
      if (next < this.tree.length && this.tree[next]! <= rest) {
        pos = next;
        rest -= this.tree[next]!;
      }
    }
    return { entrant: pos, within: rest };
  }

  /** Draws one ticket uniformly from everything still in the pool. */
  draw(randomInt: RandomInt, removeWholeEntrant: boolean): { entrant: number; ticket: number } {
    const k = randomInt(this.total);
    const { entrant, within } = this.find(k);
    // Map "within-th remaining ticket" to the entrant's original ticket offset,
    // skipping offsets already drawn (only happens when repeat winners are allowed).
    let offset = within;
    for (const d of this.drawnOffsets[entrant]!) {
      if (d <= offset) offset++;
      else break;
    }
    const ticket = this.starts[entrant]! + offset + 1;
    if (removeWholeEntrant) {
      this.add(entrant, -this.remaining[entrant]!);
      this.remaining[entrant] = 0;
    } else {
      this.add(entrant, -1);
      this.remaining[entrant]!--;
      const list = this.drawnOffsets[entrant]!;
      let at = 0;
      while (at < list.length && list[at]! < offset) at++;
      list.splice(at, 0, offset);
    }
    return { entrant, ticket };
  }

  /** Re-applies earlier picks (used by drawNext so a continued draw never changes them). */
  replay(pick: RafflePick, removeWholeEntrant: boolean) {
    const offset = pick.ticket - 1 - this.starts[pick.entrant]!;
    if (removeWholeEntrant) {
      this.add(pick.entrant, -this.remaining[pick.entrant]!);
      this.remaining[pick.entrant] = 0;
    } else {
      this.add(pick.entrant, -1);
      this.remaining[pick.entrant]!--;
      const list = this.drawnOffsets[pick.entrant]!;
      list.push(offset);
      list.sort((a, b) => a - b);
    }
  }
}

/** How many picks are possible: people (no repeats) or tickets (repeats allowed). */
export function availablePicks(holders: readonly TicketHolder[], allowRepeatWinners: boolean): number {
  return allowRepeatWinners ? holders.reduce((s, h) => s + h.tickets, 0) : holders.length;
}

function validate(holders: readonly TicketHolder[], winners: number, alternates: number, allowRepeat: boolean): DrawResult | null {
  if (holders.length === 0) return { ok: false, reason: "no_entries" };
  const tickets = holders.reduce((s, h) => s + h.tickets, 0);
  if (tickets > MAX_TICKETS) return { ok: false, reason: "too_many_tickets", available: MAX_TICKETS, requested: tickets };
  if (
    !Number.isInteger(winners) || winners < 1 || winners > MAX_WINNERS ||
    !Number.isInteger(alternates) || alternates < 0 || alternates > MAX_ALTERNATES
  ) {
    return { ok: false, reason: "bad_count" };
  }
  const available = availablePicks(holders, allowRepeat);
  if (winners + alternates > available) {
    return { ok: false, reason: "not_enough_entries", available, requested: winners + alternates };
  }
  return null;
}

/**
 * Draws all winners, then all alternates, in one go.
 * Each pick takes one ticket uniformly at random from the tickets still in the draw
 * (crypto.getRandomValues + rejection sampling), so someone with 3 tickets is exactly
 * 3 times as likely as someone with 1 ticket on that pick.
 */
export function drawRaffle(holders: readonly TicketHolder[], options: DrawOptions): DrawResult {
  const { winners, alternates = 0, allowRepeatWinners = false, randomInt = secureRandomInt } = options;
  const invalid = validate(holders, winners, alternates, allowRepeatWinners);
  if (invalid) return invalid;
  const pool = new TicketPool(holders);
  const picks: RafflePick[] = [];
  for (let i = 0; i < winners + alternates; i++) {
    const { entrant, ticket } = pool.draw(randomInt, !allowRepeatWinners);
    const isWinner = i < winners;
    picks.push({ kind: isWinner ? "winner" : "alternate", position: isWinner ? i + 1 : i - winners + 1, entrant, ticket });
  }
  if (!isValidDraw(holders, picks, allowRepeatWinners)) throw new Error("Internal error: invalid draw");
  return { ok: true, picks };
}

/**
 * Draws ONE more pick after `previous`, for "one at a time" reveals and "Draw another alternate".
 * Earlier picks are never changed; the new pick comes from the tickets that are left.
 * Winners come first: once an alternate exists, no more winners can be added.
 */
export function drawNext(
  holders: readonly TicketHolder[],
  previous: readonly RafflePick[],
  kind: RafflePick["kind"],
  options: Pick<DrawOptions, "allowRepeatWinners" | "randomInt"> = {},
): DrawResult {
  const { allowRepeatWinners = false, randomInt = secureRandomInt } = options;
  const winnersSoFar = previous.filter((p) => p.kind === "winner").length;
  const altsSoFar = previous.length - winnersSoFar;
  const nextWinners = winnersSoFar + (kind === "winner" ? 1 : 0);
  const nextAlts = altsSoFar + (kind === "alternate" ? 1 : 0);
  if (kind === "winner" && altsSoFar > 0) return { ok: false, reason: "bad_count" };
  if (kind === "alternate" && winnersSoFar === 0) return { ok: false, reason: "bad_count" };
  const invalid = validate(holders, nextWinners, nextAlts, allowRepeatWinners);
  if (invalid) return invalid;
  if (!isValidDraw(holders, previous, allowRepeatWinners)) {
    throw new Error("Internal error: previous picks don't match these entries");
  }
  const pool = new TicketPool(holders);
  for (const p of previous) pool.replay(p, !allowRepeatWinners);
  const { entrant, ticket } = pool.draw(randomInt, !allowRepeatWinners);
  const position = kind === "winner" ? nextWinners : nextAlts;
  return { ok: true, picks: [...previous, { kind, position, entrant, ticket }] };
}

/** Final guard + test helper: no ticket twice, and no person twice unless repeats are allowed. */
export function isValidDraw(holders: readonly TicketHolder[], picks: readonly RafflePick[], allowRepeatWinners: boolean): boolean {
  const starts: number[] = [];
  let acc = 0;
  for (const h of holders) {
    starts.push(acc);
    acc += h.tickets;
  }
  const tickets = new Set<number>();
  const people = new Set<number>();
  for (const p of picks) {
    if (p.entrant < 0 || p.entrant >= holders.length) return false;
    const offset = p.ticket - 1 - starts[p.entrant]!;
    if (!Number.isInteger(offset) || offset < 0 || offset >= holders[p.entrant]!.tickets) return false;
    if (tickets.has(p.ticket)) return false;
    if (!allowRepeatWinners && people.has(p.entrant)) return false;
    tickets.add(p.ticket);
    people.add(p.entrant);
  }
  return true;
}
