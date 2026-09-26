import { describe, expect, it } from "vitest";
import { randomInt, shuffle } from "@/lib/random";
import { generateTeams, parseTeamNames } from "@/lib/teams";
import { parseChoicesWithStats } from "@/lib/wheel";
import { decodeShareHash, encodeShareHash } from "@/lib/share-codec";

describe("randomInt", () => {
  it("never returns >= n", () => {
    for (let i = 0; i < 5000; i++) {
      const n = 2 + (i % 20);
      const v = randomInt(n);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(n);
    }
  });

  it("passes a chi-square check for randomInt(6)", () => {
    const n = 6;
    const trials = 60_000;
    const counts = new Array(n).fill(0);
    for (let i = 0; i < trials; i++) counts[randomInt(n)]++;
    const expected = trials / n;
    let chi = 0;
    for (const c of counts) chi += ((c - expected) ** 2) / expected;
    // df=5, critical value ~15.09 at p=0.01
    expect(chi).toBeLessThan(15.09);
  });
});

describe("shuffle", () => {
  it("keeps all elements", () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const out = shuffle(input);
    expect(out.sort()).toEqual([...input].sort());
    expect(out).toHaveLength(input.length);
  });
});

describe("parseChoicesWithStats", () => {
  it("counts over-limit separately from duplicates", () => {
    const lines = Array.from({ length: 80 }, (_, i) => `Name${i}`).join("\n");
    const parsed = parseChoicesWithStats(lines);
    expect(parsed.choices).toHaveLength(60);
    expect(parsed.duplicatesSkipped).toBe(0);
    expect(parsed.overLimit).toBe(20);
  });

  it("counts duplicates before the cap", () => {
    const lines = ["Alex", "alex", ...Array.from({ length: 60 }, (_, i) => `N${i}`)].join("\n");
    const parsed = parseChoicesWithStats(lines);
    expect(parsed.duplicatesSkipped).toBe(1);
    expect(parsed.choices).toHaveLength(60);
    expect(parsed.overLimit).toBe(1);
  });
});

describe("generateTeams", () => {
  it("splits 11 names into 3 teams as 4,4,3", () => {
    const names = Array.from({ length: 11 }, (_, i) => `P${i}`);
    const result = generateTeams(names, {
      mode: "groups",
      n: 3,
      leaveOut: false,
      teamNames: [],
    });
    const sizes = result.teams.map((t) => t.members.length).sort((a, b) => b - a);
    expect(sizes).toEqual([4, 4, 3]);
  });

  it("pairs 7 names as 3,2,2", () => {
    const names = Array.from({ length: 7 }, (_, i) => `P${i}`);
    const result = generateTeams(names, {
      mode: "size",
      n: 2,
      leaveOut: false,
      teamNames: [],
    });
    const sizes = result.teams.map((t) => t.members.length).sort((a, b) => b - a);
    expect(sizes).toEqual([3, 2, 2]);
  });

  it("pairs with leave-out yields 3 pairs + sits out", () => {
    const names = Array.from({ length: 7 }, (_, i) => `P${i}`);
    const result = generateTeams(names, {
      mode: "size",
      n: 2,
      leaveOut: true,
      teamNames: [],
    });
    expect(result.teams).toHaveLength(3);
    expect(result.teams.every((t) => t.members.length === 2)).toBe(true);
    expect(result.sitsOut).toBeTruthy();
  });

  it("is roughly balanced across 10k runs of 4 names / 2 teams", () => {
    const names = ["A", "B", "C", "D"];
    const team1Hits = { A: 0, B: 0, C: 0, D: 0 };
    const runs = 10_000;
    for (let i = 0; i < runs; i++) {
      const result = generateTeams(names, {
        mode: "groups",
        n: 2,
        leaveOut: false,
        teamNames: [],
      });
      for (const m of result.teams[0]!.members) {
        team1Hits[m as keyof typeof team1Hits]++;
      }
    }
    for (const name of names) {
      const rate = team1Hits[name as keyof typeof team1Hits] / runs;
      expect(rate).toBeGreaterThan(0.48);
      expect(rate).toBeLessThan(0.52);
    }
  });
});

describe("parseTeamNames", () => {
  it("keeps case-insensitive duplicates and flags them", () => {
    const parsed = parseTeamNames("Alex\nalex\nSam");
    expect(parsed.names).toEqual(["Alex", "alex", "Sam"]);
    expect(parsed.duplicateLabels).toEqual(["Alex"]);
  });
});

describe("share-codec", () => {
  it("round-trips choices and preserves extra fields", () => {
    const hash = encodeShareHash(["A", "B"], "home", { team: { mode: "groups", n: 2 } });
    const decoded = decodeShareHash(hash);
    expect(decoded?.choices).toEqual(["A", "B"]);
    expect(decoded?.extra.team).toEqual({ mode: "groups", n: 2 });
  });

  it("still decodes legacy payloads without extra keys", () => {
    const hash = encodeShareHash(["Alex", "Jordan"], "classroom-spinner");
    const decoded = decodeShareHash(hash);
    expect(decoded?.choices).toEqual(["Alex", "Jordan"]);
    expect(decoded?.extra).toEqual({});
  });
});
