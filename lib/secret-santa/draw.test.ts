import { describe, expect, it } from "vitest";
import {
  buildAllowed,
  drawSecretSanta,
  isValidAssignment,
  secureRandomInt,
  type Exclusion,
  type RandomInt,
} from "./draw";

/** Deterministic RNG for reproducible tests (mulberry32). */
function seeded(seed: number): RandomInt {
  let a = seed >>> 0;
  return (max) => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    const r = ((t ^ (t >>> 14)) >>> 0) / 2 ** 32;
    return Math.floor(r * max);
  };
}

const isSingleCycle = (a: number[]) => {
  let cur = 0;
  let steps = 0;
  do {
    cur = a[cur]!;
    steps++;
  } while (cur !== 0 && steps <= a.length);
  return steps === a.length;
};

describe("secureRandomInt", () => {
  it("stays in range and rejects bad input", () => {
    for (let i = 0; i < 10_000; i++) {
      const v = secureRandomInt(7);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(7);
    }
    expect(() => secureRandomInt(0)).toThrow();
    expect(() => secureRandomInt(1.5)).toThrow();
  });
});

describe("drawSecretSanta — basics", () => {
  it("rejects fewer than 3 and more than 50 people", () => {
    expect(drawSecretSanta(2, [])).toMatchObject({ ok: false, reason: "too_few" });
    expect(drawSecretSanta(51, [])).toMatchObject({ ok: false, reason: "too_many" });
  });

  it("never lets anyone draw themselves (3–50 people, many runs)", () => {
    for (let n = 3; n <= 50; n++) {
      for (let run = 0; run < 40; run++) {
        const res = drawSecretSanta(n, []);
        expect(res.ok).toBe(true);
        if (!res.ok) continue;
        res.assignment.forEach((r, g) => expect(r).not.toBe(g));
        expect(new Set(res.assignment).size).toBe(n);
      }
    }
  });

  it("is roughly uniform over the 9 derangements of 4 people", () => {
    const counts = new Map<string, number>();
    const runs = 18_000;
    for (let i = 0; i < runs; i++) {
      const res = drawSecretSanta(4, []);
      if (res.ok) counts.set(res.assignment.join(""), (counts.get(res.assignment.join("")) ?? 0) + 1);
    }
    expect(counts.size).toBe(9);
    for (const c of counts.values()) {
      expect(c).toBeGreaterThan(1700);
      expect(c).toBeLessThan(2300);
    }
  });

  it("is reproducible with an injected RNG", () => {
    const a = drawSecretSanta(10, [], { randomInt: seeded(42) });
    const b = drawSecretSanta(10, [], { randomInt: seeded(42) });
    expect(a).toEqual(b);
  });
});

describe("exclusions", () => {
  it("two-way exclusions: couples never draw each other", () => {
    const ex: Exclusion[] = [
      { from: 0, to: 1, mutual: true },
      { from: 2, to: 3, mutual: true },
    ];
    for (let i = 0; i < 2000; i++) {
      const res = drawSecretSanta(6, ex);
      expect(res.ok).toBe(true);
      if (!res.ok) continue;
      expect(res.assignment[0]).not.toBe(1);
      expect(res.assignment[1]).not.toBe(0);
      expect(res.assignment[2]).not.toBe(3);
      expect(res.assignment[3]).not.toBe(2);
    }
  });

  it("one-way exclusion blocks only that direction", () => {
    const ex: Exclusion[] = [{ from: 0, to: 1, mutual: false }];
    let reverseSeen = false;
    for (let i = 0; i < 2000; i++) {
      const res = drawSecretSanta(4, ex);
      expect(res.ok).toBe(true);
      if (!res.ok) continue;
      expect(res.assignment[0]).not.toBe(1);
      if (res.assignment[1] === 0) reverseSeen = true;
    }
    expect(reverseSeen).toBe(true);
  });

  it("two couples in a group of four still works", () => {
    const ex: Exclusion[] = [
      { from: 0, to: 1, mutual: true },
      { from: 2, to: 3, mutual: true },
    ];
    const res = drawSecretSanta(4, ex);
    expect(res.ok).toBe(true);
    if (res.ok) expect(isValidAssignment(res.assignment, buildAllowed(4, ex))).toBe(true);
  });

  it("falls back to backtracking search when retries are not enough", () => {
    const n = 12;
    const ex: Exclusion[] = [];
    for (let g = 0; g < n; g++)
      for (let r = 0; r < n; r++)
        if (r !== g && r !== (g + 1) % n && r !== (g + 2) % n)
          ex.push({ from: g, to: r, mutual: false });
    const allowed = buildAllowed(n, ex);
    for (let i = 0; i < 200; i++) {
      const res = drawSecretSanta(n, ex, { maxShuffleAttempts: 0 });
      expect(res.ok).toBe(true);
      if (res.ok) expect(isValidAssignment(res.assignment, allowed)).toBe(true);
    }
  });
});

describe("impossible configurations", () => {
  it("3 people where 0 and 1 exclude each other → impossible, explains why", () => {
    const res = drawSecretSanta(3, [{ from: 0, to: 1, mutual: true }]);
    expect(res).toMatchObject({ ok: false, reason: "impossible" });
    if (!res.ok) {
      expect(res.hallGivers).toEqual([0, 1]);
      expect(res.hallReceivers).toEqual([2]);
    }
  });

  it("someone excluded from everyone → blockedGivers", () => {
    const ex: Exclusion[] = [1, 2, 3].map((to) => ({ from: 0, to, mutual: false }));
    const res = drawSecretSanta(4, ex);
    expect(res).toMatchObject({ ok: false, reason: "impossible" });
    if (!res.ok) expect(res.blockedGivers).toEqual([0]);
  });

  it("someone nobody may draw → blockedReceivers", () => {
    const ex: Exclusion[] = [1, 2, 3].map((from) => ({ from, to: 0, mutual: false }));
    const res = drawSecretSanta(4, ex);
    expect(res).toMatchObject({ ok: false, reason: "impossible" });
    if (!res.ok) expect(res.blockedReceivers).toEqual([0]);
  });

  it("ignores invalid exclusions (self or out of range)", () => {
    const res = drawSecretSanta(3, [
      { from: 0, to: 0, mutual: true },
      { from: 0, to: 9, mutual: true },
    ]);
    expect(res.ok).toBe(true);
  });
});

describe("single-cycle mode", () => {
  it("puts everyone in one loop", () => {
    for (let n = 3; n <= 50; n += 1) {
      const res = drawSecretSanta(n, [], { singleCycle: true });
      expect(res.ok).toBe(true);
      if (res.ok) expect(isSingleCycle(res.assignment)).toBe(true);
    }
  });

  it("respects exclusions in one loop", () => {
    const ex: Exclusion[] = [
      { from: 0, to: 1, mutual: true },
      { from: 2, to: 3, mutual: true },
      { from: 4, to: 5, mutual: true },
    ];
    const allowed = buildAllowed(8, ex);
    for (let i = 0; i < 500; i++) {
      const res = drawSecretSanta(8, ex, { singleCycle: true });
      expect(res.ok).toBe(true);
      if (res.ok) expect(isValidAssignment(res.assignment, allowed, true)).toBe(true);
    }
  });

  it("uses the backtracking search when retries are disabled", () => {
    const ex: Exclusion[] = [{ from: 0, to: 1, mutual: true }];
    const res = drawSecretSanta(6, ex, { singleCycle: true, maxShuffleAttempts: 0 });
    expect(res.ok).toBe(true);
    if (res.ok) expect(isValidAssignment(res.assignment, buildAllowed(6, ex), true)).toBe(true);
  });

  it("reports no_loop when a normal draw exists but no single loop does", () => {
    const ex: Exclusion[] = [
      { from: 0, to: 2, mutual: true },
      { from: 0, to: 3, mutual: true },
      { from: 1, to: 2, mutual: true },
      { from: 1, to: 3, mutual: true },
    ];
    expect(drawSecretSanta(4, ex).ok).toBe(true);
    expect(drawSecretSanta(4, ex, { singleCycle: true, maxShuffleAttempts: 50 })).toMatchObject({
      ok: false,
      reason: "no_loop",
    });
  });
});
