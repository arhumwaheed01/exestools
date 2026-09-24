export type ToolId =
  | "home"
  | "random-name-picker"
  | "classroom-spinner"
  | "prize-wheel"
  | "yes-no-wheel";

export function cleanPathFor(toolId: ToolId): string {
  if (toolId === "home") return "/";
  return `/${toolId}`;
}

/** Default "auto-remove winner" for teacher/name tools. */
export function defaultAutoRemoveWinner(toolId: ToolId): boolean {
  return toolId === "classroom-spinner" || toolId === "random-name-picker";
}
