import { describe, expect, it } from "vitest";
import {
  classroomEmbedChoices,
  isClassroomEmbedSlug,
} from "@/lib/classroom-embed";

describe("classroom embed slugs", () => {
  it("allows only the four public slugs", () => {
    expect(isClassroomEmbedSlug("class-roster")).toBe(true);
    expect(isClassroomEmbedSlug("classroom-jobs")).toBe(true);
    expect(isClassroomEmbedSlug("brain-breaks")).toBe(true);
    expect(isClassroomEmbedSlug("reading-groups")).toBe(true);
    expect(isClassroomEmbedSlug("names")).toBe(false);
    expect(isClassroomEmbedSlug("classroom-students")).toBe(false);
  });

  it("loads starter lists from classroom presets", () => {
    expect(classroomEmbedChoices("classroom-jobs")).toContain("Line leader");
    expect(classroomEmbedChoices("classroom-jobs")).not.toContain("Ava");
    expect(classroomEmbedChoices("class-roster")).toContain("Ava");
    expect(classroomEmbedChoices("brain-breaks")).toContain("Stretch");
    expect(classroomEmbedChoices("reading-groups")).toEqual([
      "Group A",
      "Group B",
      "Group C",
      "Group D",
    ]);
  });
});
