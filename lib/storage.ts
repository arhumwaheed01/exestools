const STORAGE_KEY = "exestools.spinner.v1";
const PREFS_KEY = "exestools.spinner.prefs.v1";

export type SpinnerPrefs = {
  soundEnabled: boolean;
};

export type SpinnerSession = {
  choices: string[];
  updatedAt: number;
};

export function loadSession(): SpinnerSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
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

export function saveSession(choices: string[]): void {
  if (typeof window === "undefined") return;
  try {
    const payload: SpinnerSession = { choices: choices.slice(0, 60), updatedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
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

/** Encode choices into a short URL-safe query value. */
export function encodeChoicesParam(choices: string[]): string | null {
  try {
    const joined = choices.join("\n");
    const b64 =
      typeof btoa === "function"
        ? btoa(unescape(encodeURIComponent(joined)))
        : Buffer.from(joined, "utf8").toString("base64");
    const urlSafe = b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    if (urlSafe.length > 1800) return null;
    return urlSafe;
  } catch {
    return null;
  }
}

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
