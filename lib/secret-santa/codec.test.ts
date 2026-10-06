import { describe, expect, it } from "vitest";
import {
  decodeReveal,
  decodeSetup,
  encodeToken,
  readHash,
  revealUrl,
  type RevealPayload,
} from "./codec";

const reveal: RevealPayload = {
  v: 1,
  g: "Zoë",
  r: "Ahmed 🎄",
  c: "K7F2",
  e: "Office party",
  b: "£20",
  d: "2026-12-18",
  n: "Wrap it!",
};

describe("codec", () => {
  it("round-trips a reveal payload, including accents and emoji", () => {
    const url = revealUrl("https://www.exestools.com", reveal);
    const parsed = readHash(new URL(url).hash);
    expect(parsed?.kind).toBe("reveal");
    expect(decodeReveal(parsed!.token)).toEqual(reveal);
  });

  it("is not readable at a glance (no plain or base64 names in the token)", () => {
    const token = encodeToken({ ...reveal, r: "Alexandra" });
    const plainB64 = btoa("Alexandra").replace(/=+$/, "");
    expect(token).not.toContain("Alexandra");
    expect(token).not.toContain(plainB64);
  });

  it("gives different tokens for the same payload (random salt)", () => {
    expect(encodeToken(reveal)).not.toBe(encodeToken(reveal));
  });

  it("rejects tampered, truncated or foreign tokens", () => {
    const token = encodeToken(reveal);
    expect(decodeReveal(token.slice(0, 10))).toBeNull();
    expect(decodeReveal("not*base64")).toBeNull();
    expect(decodeReveal(btoa('{"v":1}'))).toBeNull();
  });

  it("validates setup payloads", () => {
    const ok = encodeToken({ v: 1, p: ["A", "B", "C"], x: [[0, 1, 1]] });
    expect(decodeSetup(ok)?.p).toEqual(["A", "B", "C"]);
    const badIndex = encodeToken({ v: 1, p: ["A", "B", "C"], x: [[0, 5, 1]] });
    expect(decodeSetup(badIndex)).toBeNull();
  });

  it("readHash only accepts #r= and #s=", () => {
    expect(readHash("#w=abc")).toBeNull();
    expect(readHash("#s=abc")?.kind).toBe("setup");
  });
});
