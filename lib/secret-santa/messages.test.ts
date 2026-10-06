import { describe, expect, it } from "vitest";
import { drawSecretSanta } from "./draw";
import { describeFailure } from "./messages";

describe("describeFailure", () => {
  it("names the stuck people for the classic 3-person couple case", () => {
    const res = drawSecretSanta(3, [{ from: 0, to: 1, mutual: true }]);
    if (res.ok) throw new Error("expected failure");
    expect(describeFailure(res, ["Ava", "Ben", "Cal"])).toBe(
      "No valid draw: Ava and Ben can only draw Cal between them, and each person can only be drawn once. Remove an exclusion involving them, or add another person.",
    );
  });
  it("names a person who can't draw anyone", () => {
    const res = drawSecretSanta(
      4,
      [1, 2, 3].map((to) => ({ from: 0, to, mutual: false })),
    );
    if (res.ok) throw new Error("expected failure");
    expect(describeFailure(res, ["Ava", "Ben", "Cal", "Dee"])).toMatch(
      /^No valid draw: Ava can't draw anyone/,
    );
  });
  it("explains when no single loop is possible", () => {
    const ex = [
      { from: 0, to: 2, mutual: true },
      { from: 0, to: 3, mutual: true },
      { from: 1, to: 2, mutual: true },
      { from: 1, to: 3, mutual: true },
    ];
    const res = drawSecretSanta(4, ex, { singleCycle: true, maxShuffleAttempts: 50 });
    if (res.ok) throw new Error("expected failure");
    expect(describeFailure(res, ["Ava", "Ben", "Cal", "Dee"])).toMatch(
      /^No single loop fits these exclusions/,
    );
  });
  it("explains too few people", () => {
    const res = drawSecretSanta(2, []);
    if (res.ok) throw new Error("expected failure");
    expect(describeFailure(res, ["Ava", "Ben"])).toBe("Add at least 3 people to draw names.");
  });
});
