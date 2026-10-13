import { TOOLS } from "@/lib/tools";

const EXTRA: Record<string, string> = {
  "/": "Spinner wheel",
};

/** Human label for a tool path in related-tools boxes. */
export function labelForToolPath(toolPath: string): string {
  if (EXTRA[toolPath]) return EXTRA[toolPath];
  const tool = TOOLS.find((t) => t.path === toolPath);
  return tool?.footerLabel ?? toolPath.replace(/^\//, "").replace(/-/g, " ");
}
