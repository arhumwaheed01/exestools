import { describe, expect, it } from "vitest";
import { targetRotationForIndex, winnerIndexAt } from "@/lib/wheel";

describe("targetRotationForIndex", () => {
  it("keeps a random landing inside the winning slice", () => {
    const count = 8;
    for (let index = 0; index < count; index++) {
      for (let i = 0; i < 40; i++) {
        const end = targetRotationForIndex(index, count, 0, 3);
        expect(winnerIndexAt(end, count)).toBe(index);
      }
    }
  });

  it("honors an explicit sliceT away from center", () => {
    const count = 6;
    const index = 2;
    const left = targetRotationForIndex(index, count, 0, 2, 0.2);
    const right = targetRotationForIndex(index, count, 0, 2, 0.8);
    expect(winnerIndexAt(left, count)).toBe(index);
    expect(winnerIndexAt(right, count)).toBe(index);
    expect(left).not.toBeCloseTo(right, 5);
  });
});
