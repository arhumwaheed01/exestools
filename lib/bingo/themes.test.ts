import { describe, expect, it } from "vitest";
import {
  PRESET_THEME,
  THEME_IDS,
  isThemeChoice,
  resolveTheme,
} from "./themes";

describe("resolveTheme", () => {
  it("returns explicit theme", () => {
    expect(resolveTheme("festive")).toBe("festive");
  });

  it("maps presets under auto", () => {
    expect(resolveTheme("auto", { presetId: "christmas" })).toBe("festive");
    expect(resolveTheme("auto", { presetId: "halloween" })).toBe("spooky");
    expect(resolveTheme("auto", { presetId: "baby-shower" })).toBe("pastel");
  });

  it("defaults custom lists and numbers to classic", () => {
    expect(resolveTheme("auto", { mode: "numbers" })).toBe("classic");
    expect(resolveTheme("auto", { mode: "bingo75" })).toBe("classic");
    expect(resolveTheme("auto", { mode: "words" })).toBe("classic");
  });

  it("covers every preset id", () => {
    for (const id of Object.keys(PRESET_THEME)) {
      expect(THEME_IDS).toContain(PRESET_THEME[id]);
    }
  });
});

describe("isThemeChoice", () => {
  it("accepts auto and theme ids", () => {
    expect(isThemeChoice("auto")).toBe(true);
    expect(isThemeChoice("classic")).toBe(true);
    expect(isThemeChoice("neon")).toBe(false);
  });
});
