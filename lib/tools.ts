export type ToolId =
  | "home"
  | "random-name-picker"
  | "classroom-spinner"
  | "prize-wheel"
  | "yes-no-wheel"
  | "random-team-generator";

export type ToolDef = {
  id: ToolId;
  path: string;
  navLabel: string;
  footerLabel: string;
};

/** Single source for nav / footer tool links (About & Contact stay separate). */
export const TOOLS: ToolDef[] = [
  { id: "home", path: "/", navLabel: "Spinner Wheel", footerLabel: "Spinner Wheel" },
  {
    id: "random-name-picker",
    path: "/random-name-picker",
    navLabel: "Name Picker",
    footerLabel: "Name Picker",
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
    navLabel: "Prize Wheel",
    footerLabel: "Prize Wheel",
  },
  {
    id: "yes-no-wheel",
    path: "/yes-no-wheel",
    navLabel: "Yes / No",
    footerLabel: "Yes / No",
  },
  {
    id: "random-team-generator",
    path: "/random-team-generator",
    navLabel: "Teams",
    footerLabel: "Team Generator",
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
  return toolId !== "random-team-generator";
}
