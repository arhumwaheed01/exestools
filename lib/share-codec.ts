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
};

const MAX_HASH_LEN = 6000;

/** Build `#w=v1.…` fragment for the current path. Throws if too long. */
export function encodeShareHash(choices: string[], toolId?: ToolId): string {
  const payload = compressToEncodedURIComponent(
    JSON.stringify({
      v: 1,
      choices: choices.slice(0, 60),
      toolId,
      ts: Date.now(),
    } satisfies SharePayload),
  );
  const hash = `#w=v1.${payload}`;
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
    const parsed = JSON.parse(json) as SharePayload;
    if (parsed.v !== 1 || !Array.isArray(parsed.choices)) return null;
    return {
      v: 1,
      choices: parsed.choices.filter((c) => typeof c === "string").slice(0, 60),
      toolId: parsed.toolId,
      ts: parsed.ts,
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
