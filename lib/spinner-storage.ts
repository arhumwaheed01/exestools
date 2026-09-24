import type { ToolId } from "@/lib/tools";

export type SpinnerPrefs = {
  soundEnabled: boolean;
};

export type SpinnerSession = {
  choices: string[];
  updatedAt: number;
};

export const PREFS_KEY = "exestools.spinner.prefs.v1";
const LEGACY_CHOICES_KEY = "exestools.spinner.v1";

export function choicesKey(toolId: ToolId): string {
  return `exestools.spinner.v1.${toolId}`;
}

export function loadSession(toolId: ToolId): SpinnerSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      localStorage.getItem(choicesKey(toolId)) ??
      (toolId === "home" ? localStorage.getItem(LEGACY_CHOICES_KEY) : null);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SpinnerSession;
    if (!Array.isArray(parsed.choices)) return null;
    return {
      choices: parsed.choices.filter((c) => typeof c === "string").slice(0, 60),
      updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

export function saveSession(toolId: ToolId, choices: string[]): void {
  if (typeof window === "undefined") return;
  try {
    const payload: SpinnerSession = { choices: choices.slice(0, 60), updatedAt: Date.now() };
    localStorage.setItem(choicesKey(toolId), JSON.stringify(payload));
  } catch {
    /* quota / private mode */
  }
}

export function loadPrefs(): SpinnerPrefs {
  if (typeof window === "undefined") return { soundEnabled: false };
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { soundEnabled: false };
    const parsed = JSON.parse(raw) as Partial<SpinnerPrefs>;
    return { soundEnabled: Boolean(parsed.soundEnabled) };
  } catch {
    return { soundEnabled: false };
  }
}

export function savePrefs(prefs: SpinnerPrefs): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
}

/** Legacy ?c= base64url decoder (read-only). */
export function decodeChoicesParam(param: string): string[] | null {
  try {
    const padded = param.replace(/-/g, "+").replace(/_/g, "/");
    const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
    const b64 = padded + pad;
    const json =
      typeof atob === "function"
        ? decodeURIComponent(escape(atob(b64)))
        : Buffer.from(b64, "base64").toString("utf8");
    return json
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 60);
  } catch {
    return null;
  }
}
