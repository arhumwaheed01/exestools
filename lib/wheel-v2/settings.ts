/** Spinner wheel v2 settings — localStorage only, no backend. */

export type CenterImageSize = "S" | "M" | "L";

export type WheelV2Settings = {
  tickVolume: number;
  spinSeconds: number;
  spinSlowly: boolean;
  showTitle: boolean;
  displayDuplicates: boolean;
  winnerVolume: number;
  confetti: boolean;
  animateWinner: boolean;
  /** 0 = off; otherwise seconds before auto-remove. */
  autoRemoveAfterSec: number;
  popupMessage: string;
  showRemoveButton: boolean;
  themeId: string;
  swatches: string[];
  centerImageSize: CenterImageSize;
  pageBg: string;
  pageGradient: boolean;
  wheelContours: boolean;
  shadow: boolean;
  pointerColorChange: boolean;
  maxNamesVisible: number;
};

export const DEFAULT_WHEEL_V2_SETTINGS: WheelV2Settings = {
  tickVolume: 0.7,
  spinSeconds: 10,
  spinSlowly: false,
  showTitle: false,
  displayDuplicates: false,
  winnerVolume: 0.8,
  confetti: true,
  animateWinner: true,
  autoRemoveAfterSec: 0,
  popupMessage: "We have a winner!",
  showRemoveButton: true,
  themeId: "auto",
  swatches: ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7", "#ec4899"],
  centerImageSize: "M",
  pageBg: "#0b0f17",
  pageGradient: true,
  wheelContours: true,
  shadow: true,
  pointerColorChange: false,
  maxNamesVisible: 60,
};

const SETTINGS_KEY = (toolId: string) => `et:wheel-v2:settings:${toolId}`;
const LAST_WHEEL_KEY = (toolId: string) => `et:wheel-v2:last:${toolId}`;
const RECENT_KEY = (toolId: string) => `et:wheel-v2:recent:${toolId}`;

export type SavedWheelFile = {
  v: 1;
  toolId: string;
  title: string;
  choices: string[];
  settings: WheelV2Settings;
  /** Per-entry weights keyed by lowercased name. */
  weights?: Record<string, number>;
  savedAt: number;
};

const WEIGHTS_KEY = (toolId: string) => `et:wheel-v2:weights:${toolId}`;

export function loadEntryWeights(toolId: string): Record<string, number> {
  try {
    const raw = localStorage.getItem(WEIGHTS_KEY(toolId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") return {};
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(parsed)) {
      const n = Number(v);
      if (Number.isFinite(n) && n > 0) out[k] = n;
    }
    return out;
  } catch {
    return {};
  }
}

export function saveEntryWeights(toolId: string, weights: Record<string, number>): void {
  try {
    localStorage.setItem(WEIGHTS_KEY(toolId), JSON.stringify(weights));
  } catch {
    /* ignore */
  }
}

export function normalizeWeights(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const n = Number(v);
    if (typeof k === "string" && Number.isFinite(n) && n > 0) out[k] = n;
  }
  return out;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function normalizeSettings(raw: unknown): WheelV2Settings {
  const d = DEFAULT_WHEEL_V2_SETTINGS;
  if (!raw || typeof raw !== "object") return { ...d, swatches: [...d.swatches] };
  const o = raw as Record<string, unknown>;
  const swatches = Array.isArray(o.swatches)
    ? o.swatches.filter((c): c is string => typeof c === "string").slice(0, 6)
    : [...d.swatches];
  while (swatches.length < 6) swatches.push(d.swatches[swatches.length]!);
  return {
    tickVolume: clamp(Number(o.tickVolume ?? d.tickVolume), 0, 1),
    spinSeconds: clamp(Math.round(Number(o.spinSeconds ?? d.spinSeconds)), 1, 60),
    spinSlowly: Boolean(o.spinSlowly ?? d.spinSlowly),
    showTitle: Boolean(o.showTitle ?? d.showTitle),
    displayDuplicates: Boolean(o.displayDuplicates ?? d.displayDuplicates),
    winnerVolume: clamp(Number(o.winnerVolume ?? d.winnerVolume), 0, 1),
    confetti: Boolean(o.confetti ?? d.confetti),
    animateWinner: Boolean(o.animateWinner ?? d.animateWinner),
    autoRemoveAfterSec: clamp(Math.round(Number(o.autoRemoveAfterSec ?? d.autoRemoveAfterSec)), 0, 60),
    popupMessage:
      typeof o.popupMessage === "string" && o.popupMessage.trim()
        ? o.popupMessage.slice(0, 80)
        : d.popupMessage,
    showRemoveButton: Boolean(o.showRemoveButton ?? d.showRemoveButton),
    themeId: typeof o.themeId === "string" ? o.themeId : d.themeId,
    swatches,
    centerImageSize:
      o.centerImageSize === "S" || o.centerImageSize === "M" || o.centerImageSize === "L"
        ? o.centerImageSize
        : d.centerImageSize,
    pageBg: typeof o.pageBg === "string" ? o.pageBg : d.pageBg,
    pageGradient: Boolean(o.pageGradient ?? d.pageGradient),
    wheelContours: Boolean(o.wheelContours ?? d.wheelContours),
    shadow: Boolean(o.shadow ?? d.shadow),
    pointerColorChange: Boolean(o.pointerColorChange ?? d.pointerColorChange),
    maxNamesVisible: clamp(Math.round(Number(o.maxNamesVisible ?? d.maxNamesVisible)), 2, 60),
  };
}

export function loadWheelSettings(toolId: string): WheelV2Settings {
  if (typeof window === "undefined") {
    return { ...DEFAULT_WHEEL_V2_SETTINGS, swatches: [...DEFAULT_WHEEL_V2_SETTINGS.swatches] };
  }
  try {
    const raw = localStorage.getItem(SETTINGS_KEY(toolId));
    if (!raw) {
      return { ...DEFAULT_WHEEL_V2_SETTINGS, swatches: [...DEFAULT_WHEEL_V2_SETTINGS.swatches] };
    }
    return normalizeSettings(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_WHEEL_V2_SETTINGS, swatches: [...DEFAULT_WHEEL_V2_SETTINGS.swatches] };
  }
}

export function saveWheelSettings(toolId: string, settings: WheelV2Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY(toolId), JSON.stringify(settings));
  } catch {
    /* quota / private mode */
  }
}

export function autosaveLastWheel(
  toolId: string,
  payload: {
    title: string;
    choices: string[];
    settings: WheelV2Settings;
    weights?: Record<string, number>;
  },
): void {
  try {
    const file: SavedWheelFile = {
      v: 1,
      toolId,
      title: payload.title,
      choices: payload.choices,
      settings: payload.settings,
      weights: payload.weights,
      savedAt: Date.now(),
    };
    localStorage.setItem(LAST_WHEEL_KEY(toolId), JSON.stringify(file));
  } catch {
    /* ignore */
  }
}

export function loadLastWheel(toolId: string): SavedWheelFile | null {
  try {
    const raw = localStorage.getItem(LAST_WHEEL_KEY(toolId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedWheelFile;
    if (parsed?.v !== 1 || !Array.isArray(parsed.choices)) return null;
    return {
      ...parsed,
      settings: normalizeSettings(parsed.settings),
    };
  } catch {
    return null;
  }
}

export function pushRecentWheel(toolId: string, file: SavedWheelFile): void {
  try {
    const list = loadRecentWheels(toolId).filter((r) => r.savedAt !== file.savedAt);
    list.unshift(file);
    localStorage.setItem(RECENT_KEY(toolId), JSON.stringify(list.slice(0, 8)));
  } catch {
    /* ignore */
  }
}

export function loadRecentWheels(toolId: string): SavedWheelFile[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY(toolId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedWheelFile[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((f) => f?.v === 1 && Array.isArray(f.choices))
      .map((f) => ({ ...f, settings: normalizeSettings(f.settings) }));
  } catch {
    return [];
  }
}

/** Settings safe for share links (no local images). */
export function settingsForShare(settings: WheelV2Settings): Partial<WheelV2Settings> {
  const {
    tickVolume,
    spinSeconds,
    spinSlowly,
    showTitle,
    displayDuplicates,
    winnerVolume,
    confetti,
    animateWinner,
    autoRemoveAfterSec,
    popupMessage,
    showRemoveButton,
    themeId,
    swatches,
    centerImageSize,
    pageBg,
    pageGradient,
    wheelContours,
    shadow,
    pointerColorChange,
    maxNamesVisible,
  } = settings;
  return {
    tickVolume,
    spinSeconds,
    spinSlowly,
    showTitle,
    displayDuplicates,
    winnerVolume,
    confetti,
    animateWinner,
    autoRemoveAfterSec,
    popupMessage,
    showRemoveButton,
    themeId,
    swatches,
    centerImageSize,
    pageBg,
    pageGradient,
    wheelContours,
    shadow,
    pointerColorChange,
    maxNamesVisible,
  };
}

export function spinMsFromSettings(settings: WheelV2Settings, reduceMotion: boolean): number {
  if (reduceMotion) return 300;
  const base = settings.spinSeconds * 1000;
  return settings.spinSlowly ? Math.round(base * 1.35) : base;
}
