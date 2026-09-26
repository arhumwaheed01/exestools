import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";
import type { ToolId } from "@/lib/tools";

export type SharePayload = {
  v: 1;
  choices: string[];
  toolId?: ToolId;
  ts?: number;
  /** Any other top-level keys from the encoded JSON (team, num, raffle, …). */
  extra: Record<string, unknown>;
};

const MAX_HASH_LEN = 6000;

/** Build `#w=v1.…` fragment. Optional `extra` fields are merged into the payload. */
export function encodeShareHash(
  choices: string[],
  toolId?: ToolId,
  extra?: Record<string, unknown>,
): string {
  const payload: Record<string, unknown> = {
    v: 1,
    choices,
    toolId,
    ts: Date.now(),
    ...extra,
  };
  const compressed = compressToEncodedURIComponent(JSON.stringify(payload));
  const hash = `#w=v1.${compressed}`;
  if (hash.length > MAX_HASH_LEN) {
    throw new Error("LIST_TOO_LONG");
  }
  return hash;
}

export function decodeShareHash(hash: string): SharePayload | null {
  try {
    const raw = hash.startsWith("#") ? hash.slice(1) : hash;
    if (!raw.startsWith("w=v1.")) return null;
    const compressed = raw.slice("w=v1.".length);
    if (!compressed) return null;
    const json = decompressFromEncodedURIComponent(compressed);
    if (!json) return null;
    const parsed = JSON.parse(json) as Record<string, unknown>;
    if (parsed.v !== 1 || !Array.isArray(parsed.choices)) return null;
    const choices = parsed.choices.filter((c): c is string => typeof c === "string");
    const { v: _v, choices: _c, toolId, ts, ...rest } = parsed;
    return {
      v: 1,
      choices,
      toolId: typeof toolId === "string" ? (toolId as ToolId) : undefined,
      ts: typeof ts === "number" ? ts : undefined,
      extra: rest,
    };
  } catch {
    return null;
  }
}

/** Read hash from window.location.hash (client only). */
export function readShareFromLocation(): SharePayload | null {
  if (typeof window === "undefined") return null;
  return decodeShareHash(window.location.hash || "");
}
