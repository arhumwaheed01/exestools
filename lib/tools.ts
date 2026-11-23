export type ToolId =
  | "home"
  | "random-name-picker"
  | "classroom-spinner"
  | "prize-wheel"
  | "yes-no-wheel"
  | "random-team-generator"
  | "secret-santa-generator"
  | "random-number-wheel"
  | "raffle-generator"
  | "bingo-card-generator"
  | "time-card-calculator"
  | "overtime-calculator";

export type ToolDef = {
  id: ToolId;
  path: string;
  navLabel: string;
  footerLabel: string;
  /** When false, omit from primary header (footer + tool links still show it). Default true. */
  inHeaderNav?: boolean;
};

/** Single source for nav / footer tool links (About & Contact stay separate). */
export const TOOLS: ToolDef[] = [
  { id: "home", path: "/", navLabel: "Spinner", footerLabel: "Spinner wheel" },
  {
    id: "random-name-picker",
    path: "/random-name-picker",
    navLabel: "Names",
    footerLabel: "Name picker",
  },
  {
    id: "classroom-spinner",
    path: "/classroom-spinner",
    navLabel: "Classroom",
    footerLabel: "Classroom",
  },
  {
    id: "prize-wheel",
    path: "/prize-wheel",
    navLabel: "Prize",
    footerLabel: "Prize wheel",
  },
  {
    id: "yes-no-wheel",
    path: "/yes-no-wheel",
    navLabel: "Yes/No",
    footerLabel: "Yes or no wheel",
  },
  {
    id: "random-team-generator",
    path: "/random-team-generator",
    navLabel: "Teams",
    footerLabel: "Random team generator",
  },
  {
    id: "secret-santa-generator",
    path: "/secret-santa-generator",
    navLabel: "Secret Santa",
    footerLabel: "Secret Santa",
  },
  {
    id: "random-number-wheel",
    path: "/random-number-wheel",
    navLabel: "Numbers",
    footerLabel: "Number wheel",
  },
  {
    id: "raffle-generator",
    path: "/raffle-generator",
    navLabel: "Raffle",
    footerLabel: "Raffle generator",
  },
  {
    id: "bingo-card-generator",
    path: "/bingo-card-generator",
    navLabel: "Bingo",
    footerLabel: "Bingo cards",
  },
  {
    id: "time-card-calculator",
    path: "/time-card-calculator",
    navLabel: "Time card",
    footerLabel: "Time card calculator",
    inHeaderNav: false,
  },
  {
    id: "overtime-calculator",
    path: "/overtime-calculator",
    navLabel: "Overtime",
    footerLabel: "Overtime calculator",
    inHeaderNav: false,
  },
];

export function cleanPathFor(toolId: ToolId): string {
  if (toolId === "home") return "/";
  return `/${toolId}`;
}

/** Default "auto-remove winner" for teacher/name tools. */
export function defaultAutoRemoveWinner(toolId: ToolId): boolean {
  return toolId === "classroom-spinner" || toolId === "random-name-picker";
}

export function isWheelTool(toolId: ToolId): boolean {
  return (
    toolId !== "random-team-generator" &&
    toolId !== "random-number-wheel" &&
    toolId !== "secret-santa-generator" &&
    toolId !== "raffle-generator" &&
    toolId !== "bingo-card-generator" &&
    toolId !== "time-card-calculator" &&
    toolId !== "overtime-calculator"
  );
}
