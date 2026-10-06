// lib/raffle/draw.test.ts
import { describe, expect, it } from "vitest";
import { drawNext, drawRaffle, isValidDraw, MAX_ALTERNATES, MAX_WINNERS, type RafflePick } from "./draw";
import type { RandomInt } from "./random";

/** Deterministic RNG for reproducible tests (mulberry32). */
function seeded(seed: number): RandomInt {
  let a = seed >>> 0;
  return (max) => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return Math.floor((((t ^ (t >>> 14)) >>> 0) / 2 ** 32) * max);
  };
}

const people = (...tickets: number[]) => tickets.map((t) => ({ tickets: t }));
const ok = (r: ReturnType<typeof drawRaffle>) => {
  if (!r.ok) throw new Error(`draw failed: ${r.reason}`);
  return r.picks;
};

describe("validation and limits", () => {
  it("rejects empty lists, bad counts and over-asking", () => {
    expect(drawRaffle([], { winners: 1 })).toMatchObject({ ok: false, reason: "no_entries" });
    expect(drawRaffle(people(1, 1), { winners: 0 })).toMatchObject({ ok: false, reason: "bad_count" });
    expect(drawRaffle(people(1, 1), { winners: 1.5 })).toMatchObject({ ok: false, reason: "bad_count" });
    expect(drawRaffle(people(...Array(200).fill(1)), { winners: MAX_WINNERS + 1 })).toMatchObject({ ok: false, reason: "bad_count" });
    expect(drawRaffle(people(...Array(200).fill(1)), { winners: 1, alternates: MAX_ALTERNATES + 1 })).toMatchObject({ ok: false, reason: "bad_count" });
    expect(drawRaffle(people(3, 1), { winners: 2, alternates: 1 })).toMatchObject({
      ok: false, reason: "not_enough_entries", available: 2, requested: 3,
    });
  });

  it("counts tickets, not people, as available when repeats are allowed", () => {
    expect(drawRaffle(people(3, 1), { winners: 4, allowRepeatWinners: true }).ok).toBe(true);
    expect(drawRaffle(people(3, 1), { winners: 5, allowRepeatWinners: true })).toMatchObject({ reason: "not_enough_entries", available: 4 });
  });

  it("blocks more than 10,000 tickets", () => {
    expect(drawRaffle(people(9_999, 2), { winners: 1 })).toMatchObject({ ok: false, reason: "too_many_tickets" });
  });

  it("a single entrant can win", () => {
    expect(ok(drawRaffle(people(1), { winners: 1 }))).toEqual([{ kind: "winner", position: 1, entrant: 0, ticket: 1 }]);
  });
});

describe("no repeat winners (default)", () => {
  it("never picks the same person twice, across winners and alternates", () => {
    const holders = people(5, 1, 3, 1, 2, 8, 1, 1);
    for (let run = 0; run < 2_000; run++) {
      const picks = ok(drawRaffle(holders, { winners: 4, alternates: 4 }));
      expect(new Set(picks.map((p) => p.entrant)).size).toBe(8);
      expect(isValidDraw(holders, picks, false)).toBe(true);
    }
  });

  it("labels winners and alternates in draw order", () => {
    const picks = ok(drawRaffle(people(1, 1, 1, 1, 1), { winners: 3, alternates: 2 }));
    expect(picks.map((p) => `${p.kind[0]}${p.position}`)).toEqual(["w1", "w2", "w3", "a1", "a2"]);
  });

  it("can draw everyone (full order)", () => {
    const picks = ok(drawRaffle(people(2, 2, 2), { winners: 3 }));
    expect(picks.map((p) => p.entrant).sort()).toEqual([0, 1, 2]);
  });
});

describe("fairness (crypto RNG, statistical)", () => {
  it("every ticket in 1..10 is equally likely (chi-square, 50,000 draws)", () => {
    const holders = people(...Array(10).fill(1));
    const counts = new Array(10).fill(0);
    const n = 50_000;
    for (let i = 0; i < n; i++) counts[ok(drawRaffle(holders, { winners: 1 }))[0].entrant]++;
    const expected = n / 10;
    const chi2 = counts.reduce((s, c) => s + (c - expected) ** 2 / expected, 0);
    expect(chi2).toBeLessThan(33.72); // df = 9, p = 0.0001
  });

  it("multiple tickets give proportional chances: 5/3/2 tickets → 50%/30%/20% for first prize", () => {
    const counts = [0, 0, 0];
    const n = 40_000;
    for (let i = 0; i < n; i++) counts[ok(drawRaffle(people(5, 3, 2), { winners: 1 }))[0].entrant]++;
    expect(counts[0] / n).toBeCloseTo(0.5, 1);
    expect(Math.abs(counts[0] / n - 0.5)).toBeLessThan(0.015);
    expect(Math.abs(counts[1] / n - 0.3)).toBeLessThan(0.015);
    expect(Math.abs(counts[2] / n - 0.2)).toBeLessThan(0.015);
  });

  it("with 2 prizes and no repeats, matches the exact odds of winning either prize", () => {
    // P(5-ticket person wins a prize) = 5/10 + 3/10·5/7 + 2/10·5/8 = 0.839286
    // P(3-ticket) = 3/10 + 5/10·3/5 + 2/10·3/8 = 0.675 ; P(2-ticket) = 0.485714
    const won = [0, 0, 0];
    const n = 40_000;
    for (let i = 0; i < n; i++) for (const p of ok(drawRaffle(people(5, 3, 2), { winners: 2 }))) won[p.entrant]++;
    expect(Math.abs(won[0] / n - 0.839286)).toBeLessThan(0.015);
    expect(Math.abs(won[1] / n - 0.675)).toBeLessThan(0.015);
    expect(Math.abs(won[2] / n - 0.485714)).toBeLessThan(0.015);
  });

  it("with repeats allowed, a 5-of-10 ticket holder wins both prizes 2/9 of the time", () => {
    let both = 0;
    const n = 40_000;
    for (let i = 0; i < n; i++) {
      const picks = ok(drawRaffle(people(5, 3, 2), { winners: 2, allowRepeatWinners: true }));
      if (picks.every((p) => p.entrant === 0)) both++;
    }
    expect(Math.abs(both / n - 2 / 9)).toBeLessThan(0.015); // 5/10 × 4/9
  });

  it("every position is fair: each of 5 people is 1st about 20% and last about 20%", () => {
    const first = new Array(5).fill(0);
    const last = new Array(5).fill(0);
    const n = 25_000;
    for (let i = 0; i < n; i++) {
      const picks = ok(drawRaffle(people(1, 1, 1, 1, 1), { winners: 5 }));
      first[picks[0].entrant]++;
      last[picks[4].entrant]++;
    }
    for (const c of [...first, ...last]) expect(Math.abs(c / n - 0.2)).toBeLessThan(0.02);
  });

  it("list position doesn't matter: the ticket number inside a block is uniform", () => {
    const counts = new Array(4).fill(0);
    const n = 20_000;
    for (let i = 0; i < n; i++) counts[ok(drawRaffle(people(4), { winners: 1 }))[0].ticket - 1]++;
    for (const c of counts) expect(Math.abs(c / n - 0.25)).toBeLessThan(0.02);
  });
});

describe("ticket numbers", () => {
  it("are numbered down the list and always belong to the winner", () => {
    const holders = people(3, 1, 2); // tickets 1-3, 4, 5-6
    for (let i = 0; i < 500; i++) {
      for (const p of ok(drawRaffle(holders, { winners: 3 }))) {
        const range = [[1, 3], [4, 4], [5, 6]][p.entrant];
        expect(p.ticket >= range[0] && p.ticket <= range[1]).toBe(true);
      }
    }
  });

  it("with repeats allowed, no ticket is ever drawn twice and every ticket can be drawn", () => {
    const holders = people(3, 1, 2);
    const picks = ok(drawRaffle(holders, { winners: 6, allowRepeatWinners: true }));
    expect(picks.map((p) => p.ticket).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(isValidDraw(holders, picks, true)).toBe(true);
  });
});

describe("drawNext (one at a time, extra alternates)", () => {
  it("never changes earlier picks", () => {
    const holders = people(2, 1, 4, 1, 1);
    let picks: RafflePick[] = [];
    for (let i = 0; i < 3; i++) {
      const r = drawNext(holders, picks, "winner");
      if (!r.ok) throw new Error(r.reason);
      expect(r.picks.slice(0, picks.length)).toEqual(picks);
      picks = r.picks;
    }
    const alt = drawNext(holders, picks, "alternate");
    expect(alt.ok && alt.picks[3]).toMatchObject({ kind: "alternate", position: 1 });
    if (alt.ok) expect(isValidDraw(holders, alt.picks, false)).toBe(true);
  });

  it("is distributed like a fresh draw (second pick after a fixed first pick)", () => {
    // After entrant 0 (5 tickets) wins, the rest are 3 and 2 tickets → 60% / 40%.
    const first: RafflePick[] = [{ kind: "winner", position: 1, entrant: 0, ticket: 2 }];
    const counts = [0, 0, 0];
    const n = 20_000;
    for (let i = 0; i < n; i++) {
      const r = drawNext(people(5, 3, 2), first, "winner");
      if (r.ok) counts[r.picks[1].entrant]++;
    }
    expect(counts[0]).toBe(0);
    expect(Math.abs(counts[1] / n - 0.6)).toBeLessThan(0.02);
  });

  it("with repeats allowed, skips already-drawn tickets of the same person", () => {
    const first: RafflePick[] = [{ kind: "winner", position: 1, entrant: 0, ticket: 2 }];
    for (let i = 0; i < 300; i++) {
      const r = drawNext(people(3), first, "winner", { allowRepeatWinners: true });
      expect(r.ok && r.picks[1].ticket !== 2).toBe(true);
    }
  });

  it("refuses winners after alternates, alternates before winners, and running out", () => {
    const one: RafflePick[] = [{ kind: "winner", position: 1, entrant: 0, ticket: 1 }];
    expect(drawNext(people(1, 1), [], "alternate")).toMatchObject({ ok: false, reason: "bad_count" });
    const withAlt = drawNext(people(1, 1, 1), one, "alternate");
    if (!withAlt.ok) throw new Error("expected ok");
    expect(drawNext(people(1, 1, 1), withAlt.picks, "winner")).toMatchObject({ ok: false, reason: "bad_count" });
    expect(drawNext(people(1), one, "alternate")).toMatchObject({ ok: false, reason: "not_enough_entries" });
  });

  it("throws if earlier picks don't match the entries (list edited mid-draw)", () => {
    const bad: RafflePick[] = [{ kind: "winner", position: 1, entrant: 5, ticket: 9 }];
    expect(() => drawNext(people(1, 1), bad, "winner")).toThrow();
  });
});

describe("matches a simple reference implementation", () => {
  /** Naive drum: expand every ticket into an array and splice. Same random numbers in, same picks out. */
  function reference(tickets: number[], total: number, allowRepeat: boolean, randomInt: RandomInt) {
    const drum: { entrant: number; ticket: number }[] = [];
    let n = 0;
    tickets.forEach((t, entrant) => { for (let k = 0; k < t; k++) drum.push({ entrant, ticket: ++n }); });
    const out: { entrant: number; ticket: number }[] = [];
    for (let i = 0; i < total; i++) {
      const pick = drum[randomInt(drum.length)];
      out.push(pick);
      for (let j = drum.length - 1; j >= 0; j--) {
        if (allowRepeat ? drum[j].ticket === pick.ticket : drum[j].entrant === pick.entrant) drum.splice(j, 1);
      }
    }
    return out;
  }

  it("gives identical picks for the same random numbers (Fenwick tree vs. naive drum)", () => {
    for (let seed = 1; seed <= 300; seed++) {
      const r = seeded(seed * 7919);
      const tickets = Array.from({ length: 1 + r(40) }, () => 1 + r(6));
      const allowRepeat = seed % 2 === 0;
      const available = allowRepeat ? tickets.reduce((a, b) => a + b, 0) : tickets.length;
      const winners = 1 + r(Math.min(available, 10));
      const picks = ok(drawRaffle(people(...tickets), { winners, allowRepeatWinners: allowRepeat, randomInt: seeded(seed) }));
      const ref = reference(tickets, winners, allowRepeat, seeded(seed));
      expect(picks.map(({ entrant, ticket }) => ({ entrant, ticket }))).toEqual(ref);
    }
  });
});

describe("reproducibility and performance", () => {
  it("is reproducible with an injected RNG", () => {
    const a = drawRaffle(people(3, 1, 4, 1, 5), { winners: 3, alternates: 1, randomInt: seeded(7) });
    const b = drawRaffle(people(3, 1, 4, 1, 5), { winners: 3, alternates: 1, randomInt: seeded(7) });
    expect(a).toEqual(b);
  });

  it("draws 100 winners + 20 alternates from 10,000 tickets fast", () => {
    const singles = people(...Array(10_000).fill(1));
    let t0 = performance.now();
    const picks = ok(drawRaffle(singles, { winners: MAX_WINNERS, alternates: MAX_ALTERNATES }));
    const msSingles = performance.now() - t0;
    expect(picks).toHaveLength(120);
    expect(isValidDraw(singles, picks, false)).toBe(true);

    const mixed = people(...Array.from({ length: 2_000 }, (_, i) => (i % 5) * 2 + 1)); // 1,3,5,7,9 … = 10,000 tickets
    expect(mixed.reduce((s, h) => s + h.tickets, 0)).toBe(10_000);
    t0 = performance.now();
    const picks2 = ok(drawRaffle(mixed, { winners: MAX_WINNERS, alternates: MAX_ALTERNATES, allowRepeatWinners: true }));
    const msMixed = performance.now() - t0;
    expect(isValidDraw(mixed, picks2, true)).toBe(true);
    expect(msSingles).toBeLessThan(100);
    expect(msMixed).toBeLessThan(100);
    console.log(`perf: 10k singles ${msSingles.toFixed(2)} ms; 2k people/10k tickets ${msMixed.toFixed(2)} ms`);
  });
});
