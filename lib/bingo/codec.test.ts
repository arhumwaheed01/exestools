import { describe, expect, it } from "vitest";
import { MAX_HASH_LENGTH, decodePlayerHash, decodeSetHash, encodePlayerHash, encodeSetHash, playerUrl, readBingoHash, type SharedSet } from "./codec";
import { generateCards } from "./cards";
import { PRESETS } from "./presets";

const set: SharedSet = { mode: "words", size: 5, free: true, count: 25, seed: "K7F2Q9MX", title: "Office Party Bingo", subtitle: "Friday 4 pm", items: PRESETS[0].items };

describe("codec", () => {
  it("round-trips a word set and rebuilds identical cards", () => {
    const hash = encodeSetHash(set);
    expect(hash.startsWith("#b=v1.")).toBe(true);
    const back = decodeSetHash(hash)!;
    expect(back).toEqual(set);
    expect(generateCards(back)).toEqual(generateCards(set));
  });
  it("round-trips 75-ball and numbers sets without items", () => {
    const s75: SharedSet = { mode: "bingo75", size: 5, free: true, count: 40, seed: "BNGXQ752", title: "Bingo" };
    expect(decodeSetHash(encodeSetHash(s75))).toEqual(s75);
    const sn: SharedSet = { mode: "numbers", size: 3, free: false, count: 10, seed: "NUMBERS2", title: "", max: 20 };
    expect(decodeSetHash(encodeSetHash(sn))).toEqual(sn);
  });
  it("player links carry the card number and validate its range", () => {
    const h = encodePlayerHash(set, 12);
    expect(readBingoHash(h)).toBe("player");
    expect(decodePlayerHash(h)).toEqual({ set, card: 12 });
    expect(() => encodePlayerHash(set, 26)).toThrow();
    expect(decodeSetHash(h)).toBeNull(); // a player link is not a set link
    expect(playerUrl("https://www.exestools.com", set, 1)).toMatch(/^https:\/\/www\.exestools\.com\/bingo-card-generator#p=v1\./);
  });
  it("rejects damaged, foreign and tampered hashes", () => {
    const h = encodeSetHash(set);
    expect(decodeSetHash(h.slice(0, -10))).toBeNull();
    expect(decodeSetHash("#w=v1.abc")).toBeNull();
    expect(decodeSetHash("#b=v2." + h.slice(6))).toBeNull();
    expect(decodeSetHash(encodeSetHash({ ...set, items: ["a", "A"] }))).toBeNull(); // duplicate items
    expect(decodeSetHash(encodeSetHash({ ...set, seed: "bad" }))).toBeNull();
    expect(decodeSetHash(encodeSetHash({ ...set, count: 101 }))).toBeNull();
    expect(readBingoHash("#b=v1.<script>")).toBeNull();
  });
  it("a full 200-item list of 40-char lines fits under the cap", () => {
    const items = Array.from({ length: 200 }, (_, i) => `Item ${String(i).padStart(3, "0")} ${"long words here ".repeat(2)}`.slice(0, 40).trim());
    const h = encodeSetHash({ ...set, items });
    expect(h.length).toBeLessThanOrEqual(MAX_HASH_LENGTH);
  });
  it("round-trips an optional theme and treats missing theme as classic-compatible", () => {
    const themed: SharedSet = { ...set, theme: "festive" };
    expect(decodeSetHash(encodeSetHash(themed))).toEqual(themed);
    const bare = decodeSetHash(encodeSetHash(set))!;
    expect(bare.theme).toBeUndefined();
  });
});
