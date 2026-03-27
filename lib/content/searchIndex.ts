/**
 * Unified, deduped catalog for client-side tool search (no hardcoded tool rows).
 */

import { allTools, type TextTool } from "./textToolsData";

export type SearchableTool = {
  name: string;
  slug: string;
  description: string;
  /** Normalized tokens for matching & “related” suggestions */
  keywords: string[];
};

const STOP = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "for",
  "to",
  "in",
  "on",
  "with",
  "your",
  "free",
  "online",
  "tool",
  "tools",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .match(/[a-z0-9]+/g)
    ?.filter((w) => w.length > 1 && !STOP.has(w)) ?? [];
}

function uniqueKeywords(tool: TextTool): string[] {
  const slugParts = tool.slug.split(/[-_]+/).flatMap((p) => tokenize(p));
  const nameParts = tokenize(tool.name);
  const descParts = tokenize(tool.description);
  return [...new Set([...slugParts, ...nameParts, ...descParts])];
}

function dedupeBySlug(tools: TextTool[]): TextTool[] {
  const seen = new Set<string>();
  const out: TextTool[] = [];
  for (const t of tools) {
    if (seen.has(t.slug)) continue;
    seen.add(t.slug);
    out.push(t);
  }
  return out;
}

/** Full searchable list; safe to import from client components. */
export const searchableTools: SearchableTool[] = dedupeBySlug(allTools).map(
  (t) => ({
    name: t.name,
    slug: t.slug,
    description: t.description,
    keywords: uniqueKeywords(t),
  }),
);

export const searchableToolsBySlug = new Map(
  searchableTools.map((t) => [t.slug, t]),
);
