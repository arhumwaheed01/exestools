// Card visual themes for the bingo generator. "auto" maps presets → theme ids.

export const THEME_IDS = [
  "classic",
  "festive",
  "spooky",
  "pastel",
  "classroom",
  "harvest",
  "party",
  "trip",
] as const;

export type ThemeId = (typeof THEME_IDS)[number];
export type ThemeChoice = ThemeId | "auto";

export interface ThemeMeta {
  id: ThemeId;
  label: string;
  /** Swatch bar colours (B·I·N·G·O), 5 values. */
  letters: readonly [string, string, string, string, string];
  band: string;
}

export const THEMES: ThemeMeta[] = [
  {
    id: "classic",
    label: "Classic",
    band: "#0e7490",
    letters: ["#0e7490", "#0e7490", "#0e7490", "#0e7490", "#0e7490"],
  },
  {
    id: "festive",
    label: "Festive",
    band: "#b91c1c",
    letters: ["#b91c1c", "#15803d", "#b91c1c", "#15803d", "#b91c1c"],
  },
  {
    id: "spooky",
    label: "Spooky",
    band: "#6b21a8",
    letters: ["#c2410c", "#6b21a8", "#c2410c", "#6b21a8", "#c2410c"],
  },
  {
    id: "pastel",
    label: "Pastel",
    band: "#f9a8d4",
    letters: ["#f9a8d4", "#a5f3fc", "#fde68a", "#c4b5fd", "#bbf7d0"],
  },
  {
    id: "classroom",
    label: "Classroom",
    band: "#1d4ed8",
    letters: ["#b91c1c", "#b45309", "#15803d", "#1d4ed8", "#6d28d9"],
  },
  {
    id: "harvest",
    label: "Harvest",
    band: "#9a3412",
    letters: ["#9a3412", "#9a3412", "#9a3412", "#9a3412", "#9a3412"],
  },
  {
    id: "party",
    label: "Party",
    band: "#be185d",
    letters: ["#be185d", "#7c3aed", "#0369a1", "#047857", "#b45309"],
  },
  {
    id: "trip",
    label: "Road trip",
    band: "#047857",
    letters: ["#047857", "#047857", "#047857", "#047857", "#047857"],
  },
];

/** Preset id → theme when choice is "auto". */
export const PRESET_THEME: Record<string, ThemeId> = {
  "baby-shower": "pastel",
  christmas: "festive",
  halloween: "spooky",
  thanksgiving: "harvest",
  "new-year": "festive",
  "sight-words": "classroom",
  "math-facts": "classroom",
  meeting: "classic",
  "road-trip": "trip",
  "bridal-shower": "pastel",
  birthday: "party",
  "office-party": "classic",
};

export function isThemeId(v: unknown): v is ThemeId {
  return typeof v === "string" && (THEME_IDS as readonly string[]).includes(v);
}

export function isThemeChoice(v: unknown): v is ThemeChoice {
  return v === "auto" || isThemeId(v);
}

/** Resolve stored/UI choice to a concrete theme class id. */
export function resolveTheme(
  choice: ThemeChoice,
  opts: { presetId?: string; mode?: "words" | "bingo75" | "numbers" } = {},
): ThemeId {
  if (choice !== "auto") return choice;
  if (opts.presetId && PRESET_THEME[opts.presetId]) return PRESET_THEME[opts.presetId]!;
  if (opts.mode === "bingo75" || opts.mode === "numbers") return "classic";
  return "classic";
}

/** Wire codec short codes (optional trailing field). */
export const THEME_TO_WIRE: Record<ThemeId, string> = {
  classic: "c",
  festive: "f",
  spooky: "s",
  pastel: "p",
  classroom: "l",
  harvest: "h",
  party: "y",
  trip: "t",
};

export const THEME_FROM_WIRE: Record<string, ThemeId> = {
  c: "classic",
  f: "festive",
  s: "spooky",
  p: "pastel",
  l: "classroom",
  h: "harvest",
  y: "party",
  t: "trip",
};

/** Contrast tokens used by scripts/check-bingo-contrast.mjs (keep in sync with CSS). */
export const THEME_CONTRAST: Record<
  ThemeId,
  { band: string; bandInk: string; cell: string; cellInk: string; free: string; freeInk: string }
> = {
  classic: {
    band: "#0e7490",
    bandInk: "#ffffff",
    cell: "#ffffff",
    cellInk: "#0f172a",
    free: "#cffafe",
    freeInk: "#155e75",
  },
  festive: {
    band: "#b91c1c",
    bandInk: "#ffffff",
    cell: "#fffdf7",
    cellInk: "#1c1917",
    free: "#dcfce7",
    freeInk: "#166534",
  },
  spooky: {
    band: "#6b21a8",
    bandInk: "#ffffff",
    cell: "#fff7ed",
    cellInk: "#1c1917",
    free: "#ffedd5",
    freeInk: "#9a3412",
  },
  pastel: {
    band: "#f9a8d4",
    bandInk: "#500724",
    cell: "#ffffff",
    cellInk: "#1e293b",
    free: "#fdf2f8",
    freeInk: "#9d174d",
  },
  classroom: {
    band: "#1d4ed8",
    bandInk: "#ffffff",
    cell: "#ffffff",
    cellInk: "#0f172a",
    free: "#fef9c3",
    freeInk: "#854d0e",
  },
  harvest: {
    band: "#9a3412",
    bandInk: "#ffffff",
    cell: "#fffbeb",
    cellInk: "#292524",
    free: "#fef3c7",
    freeInk: "#92400e",
  },
  party: {
    band: "#be185d",
    bandInk: "#ffffff",
    cell: "#ffffff",
    cellInk: "#111827",
    free: "#fae8ff",
    freeInk: "#86198f",
  },
  trip: {
    band: "#047857",
    bandInk: "#ffffff",
    cell: "#f8fafc",
    cellInk: "#0f172a",
    free: "#d1fae5",
    freeInk: "#065f46",
  },
};

/** 75-ball column ball colours (B I N G O). */
export const BALL_COLORS = ["#2563eb", "#dc2626", "#475569", "#15803d", "#b45309"] as const;
