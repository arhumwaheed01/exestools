/** Shared tool visual themes (wheels, teams, raffle). Separate from bingo --bc-* cards. */

import { labelInkForBg } from "@/lib/tools/contrast";

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

/** Darker mid-tones so white/dark labels can hit 4.5:1. */
const RAW_THEMES: Omit<ToolThemeMeta, "onSeg">[] = [
  {
    id: "ocean",
    label: "Ocean",
    accent: "#0891b2",
    win: "#0e7490",
    segs: ["#0e7490", "#075985", "#0369a1", "#0e7490", "#0f766e", "#0d9488", "#0891b2", "#0284c7"],
  },
  {
    id: "candy",
    label: "Candy",
    accent: "#db2777",
    win: "#be185d",
    segs: ["#be185d", "#e11d48", "#a21caf", "#7e22ce", "#db2777", "#c026d3", "#9d174d", "#86198f"],
  },
  {
    id: "forest",
    label: "Forest",
    accent: "#15803d",
    win: "#166534",
    segs: ["#14532d", "#166534", "#15803d", "#3f6212", "#4d7c0f", "#365314", "#166534", "#3f6212"],
  },
  {
    id: "sunset",
    label: "Sunset",
    accent: "#ea580c",
    win: "#c2410c",
    segs: ["#9a3412", "#c2410c", "#ea580c", "#b45309", "#a16207", "#92400e", "#9a3412", "#c2410c"],
  },
  {
    id: "classroom",
    label: "Classroom",
    accent: "#1d4ed8",
    win: "#1e40af",
    segs: ["#b91c1c", "#b45309", "#15803d", "#1d4ed8", "#6d28d9", "#0e7490", "#be185d", "#a16207"],
  },
  {
    id: "festive",
    label: "Festive",
    accent: "#b91c1c",
    win: "#991b1b",
    segs: ["#991b1b", "#14532d", "#b91c1c", "#166534", "#9f1239", "#15803d", "#7f1d1d", "#14532d"],
  },
  {
    id: "mono",
    label: "Mono",
    accent: "#475569",
    win: "#334155",
    segs: ["#0f172a", "#1e293b", "#334155", "#475569", "#64748b", "#94a3b8", "#cbd5e1", "#e2e8f0"],
  },
  {
    id: "pastel",
    label: "Pastel",
    accent: "#db2777",
    win: "#9d174d",
    segs: ["#f9a8d4", "#a5f3fc", "#fde68a", "#c4b5fd", "#bbf7d0", "#fdba74", "#fecdd3", "#bfdbfe"],
  },
];

export const TOOL_THEMES: ToolThemeMeta[] = RAW_THEMES.map((t) => {
  const onSeg = t.segs.map((seg) => labelInkForBg(seg));
  return {
    ...t,
    onSeg: [
      onSeg[0]!,
      onSeg[1]!,
      onSeg[2]!,
      onSeg[3]!,
      onSeg[4]!,
      onSeg[5]!,
      onSeg[6]!,
      onSeg[7]!,
    ] as const,
  };
});

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
  if (toolKey === "secret-santa-generator") return "festive";
  if (toolKey === "random-team-generator") return "classroom";
  if (toolKey === "raffle-generator") return "sunset";
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
  const { segs } = segColors(theme);
  return labelInkForBg(segs[i % segs.length]!);
}
