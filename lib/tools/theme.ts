/** Shared tool visual themes (wheels, teams, raffle). Separate from bingo --bc-* cards. */

export const TOOL_THEME_IDS = [
  "auto",
  "ocean",
  "candy",
  "forest",
  "sunset",
  "classroom",
  "festive",
  "mono",
  "pastel",
] as const;

export type ToolThemeId = (typeof TOOL_THEME_IDS)[number];

export type ToolThemeMeta = {
  id: Exclude<ToolThemeId, "auto">;
  label: string;
  /** Up to 8 segment colours (readable white/dark labels chosen in CSS). */
  segs: readonly [string, string, string, string, string, string, string, string];
  onSeg: readonly [string, string, string, string, string, string, string, string];
  accent: string;
  win: string;
};

export const TOOL_THEMES: ToolThemeMeta[] = [
  {
    id: "ocean",
    label: "Ocean",
    accent: "#0891b2",
    win: "#0e7490",
    segs: ["#0e7490", "#0369a1", "#0284c7", "#0891b2", "#0d9488", "#14b8a6", "#06b6d4", "#38bdf8"],
    onSeg: ["#fff", "#fff", "#fff", "#fff", "#fff", "#0f172a", "#0f172a", "#0f172a"],
  },
  {
    id: "candy",
    label: "Candy",
    accent: "#db2777",
    win: "#be185d",
    segs: ["#db2777", "#e11d48", "#c026d3", "#a855f7", "#f472b6", "#fb7185", "#f9a8d4", "#f0abfc"],
    onSeg: ["#fff", "#fff", "#fff", "#fff", "#0f172a", "#0f172a", "#0f172a", "#0f172a"],
  },
  {
    id: "forest",
    label: "Forest",
    accent: "#15803d",
    win: "#166534",
    segs: ["#166534", "#15803d", "#16a34a", "#4d7c0f", "#65a30d", "#84cc16", "#a3e635", "#bef264"],
    onSeg: ["#fff", "#fff", "#fff", "#fff", "#fff", "#0f172a", "#0f172a", "#0f172a"],
  },
  {
    id: "sunset",
    label: "Sunset",
    accent: "#ea580c",
    win: "#c2410c",
    segs: ["#c2410c", "#ea580c", "#f97316", "#fb923c", "#f59e0b", "#eab308", "#fbbf24", "#fde047"],
    onSeg: ["#fff", "#fff", "#fff", "#0f172a", "#0f172a", "#0f172a", "#0f172a", "#0f172a"],
  },
  {
    id: "classroom",
    label: "Classroom",
    accent: "#1d4ed8",
    win: "#1e40af",
    segs: ["#b91c1c", "#b45309", "#15803d", "#1d4ed8", "#6d28d9", "#0e7490", "#be185d", "#a16207"],
    onSeg: ["#fff", "#fff", "#fff", "#fff", "#fff", "#fff", "#fff", "#fff"],
  },
  {
    id: "festive",
    label: "Festive",
    accent: "#b91c1c",
    win: "#991b1b",
    segs: ["#b91c1c", "#15803d", "#b91c1c", "#15803d", "#dc2626", "#16a34a", "#991b1b", "#166534"],
    onSeg: ["#fff", "#fff", "#fff", "#fff", "#fff", "#fff", "#fff", "#fff"],
  },
  {
    id: "mono",
    label: "Mono",
    accent: "#475569",
    win: "#334155",
    segs: ["#0f172a", "#1e293b", "#334155", "#475569", "#64748b", "#94a3b8", "#cbd5e1", "#e2e8f0"],
    onSeg: ["#fff", "#fff", "#fff", "#fff", "#fff", "#0f172a", "#0f172a", "#0f172a"],
  },
  {
    id: "pastel",
    label: "Pastel",
    accent: "#db2777",
    win: "#9d174d",
    segs: ["#f9a8d4", "#a5f3fc", "#fde68a", "#c4b5fd", "#bbf7d0", "#fdba74", "#fecdd3", "#bfdbfe"],
    onSeg: ["#500724", "#0c4a6e", "#713f12", "#4c1d95", "#14532d", "#7c2d12", "#9f1239", "#1e3a8a"],
  },
];

const DEFAULT_SEGS = TOOL_THEMES[0]!.segs;
const DEFAULT_ON = TOOL_THEMES[0]!.onSeg;

export function isToolThemeId(v: unknown): v is ToolThemeId {
  return typeof v === "string" && (TOOL_THEME_IDS as readonly string[]).includes(v);
}

export function themeStorageKey(toolKey: string): string {
  return `et:theme:${toolKey}`;
}

export function loadToolTheme(toolKey: string): ToolThemeId {
  if (typeof window === "undefined") return "auto";
  try {
    const raw = localStorage.getItem(themeStorageKey(toolKey));
    return isToolThemeId(raw) ? raw : "auto";
  } catch {
    return "auto";
  }
}

export function saveToolTheme(toolKey: string, theme: ToolThemeId): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(themeStorageKey(toolKey), theme);
  } catch {
    /* ignore */
  }
}

/** Resolve auto → ocean (dark site) or pastel-leaning light via classroom for classroom tools. */
export function resolveToolTheme(
  choice: ToolThemeId,
  toolKey?: string,
): Exclude<ToolThemeId, "auto"> {
  if (choice !== "auto") return choice;
  if (toolKey === "classroom-spinner") return "classroom";
  if (toolKey === "prize-wheel") return "candy";
  return "ocean";
}

export function segColors(theme: Exclude<ToolThemeId, "auto">): {
  segs: readonly string[];
  onSeg: readonly string[];
  accent: string;
  win: string;
} {
  const meta = TOOL_THEMES.find((t) => t.id === theme);
  if (!meta) return { segs: DEFAULT_SEGS, onSeg: DEFAULT_ON, accent: "#0891b2", win: "#0e7490" };
  return { segs: meta.segs, onSeg: meta.onSeg, accent: meta.accent, win: meta.win };
}

export function segColor(theme: Exclude<ToolThemeId, "auto">, i: number): string {
  const { segs } = segColors(theme);
  return segs[i % segs.length]!;
}

export function onSegColor(theme: Exclude<ToolThemeId, "auto">, i: number): string {
  const { onSeg } = segColors(theme);
  return onSeg[i % onSeg.length]!;
}
