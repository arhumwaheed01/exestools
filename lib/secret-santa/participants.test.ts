import { describe, expect, it } from "vitest";
import { addNames, findDuplicateIndexes, splitPasted } from "./participants";

describe("participants", () => {
  it("splits pasted lines, trims and drops blanks", () => {
    expect(splitPasted("  Sam \n\nAlex  K.\r\nJo\n")).toEqual(["Sam", "Alex K.", "Jo"]);
  });
  it("splits on commas only when there are no line breaks", () => {
    expect(splitPasted("Sam, Alex; Jo")).toEqual(["Sam", "Alex", "Jo"]);
    expect(splitPasted("Smith, John\nLee")).toEqual(["Smith, John", "Lee"]);
  });
  it("skips case-insensitive duplicates", () => {
    const r = addNames(["Sam"], ["sam", "SAM ", "Alex"]);
    expect(r.names).toEqual(["Sam", "Alex"]);
    expect(r.skippedDuplicates).toEqual(["sam", "SAM"]);
  });
  it("caps the list at 50 and rejects names over 40 characters", () => {
    const many = Array.from({ length: 60 }, (_, i) => `Person ${i + 1}`);
    const r = addNames([], [...many, "x".repeat(41)]);
    expect(r.names).toHaveLength(50);
    expect(r.skippedOverLimit).toHaveLength(10);
    expect(r.skippedTooLong).toHaveLength(1);
  });
  it("flags duplicates created by editing a row", () => {
    expect(findDuplicateIndexes(["Sam", "Alex", "sam"])).toEqual([2]);
  });
});
