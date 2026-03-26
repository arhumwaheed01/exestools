import type { SearchableTool } from "@/lib/content/searchIndex";

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

export function normalizeQuery(q: string): string {
  return q.trim().toLowerCase();
}

export function queryTokens(q: string): string[] {
  return (
    normalizeQuery(q)
      .match(/[a-z0-9]+/g)
      ?.filter((w) => w.length > 1 && !STOP.has(w)) ?? []
  );
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Highlight segments for matched query (case-insensitive). */
export function highlightParts(
  text: string,
  query: string,
): { text: string; match: boolean }[] {
  const nq = normalizeQuery(query);
  if (!nq) return [{ text, match: false }];
  try {
    const re = new RegExp(`(${escapeRegExp(nq)})`, "gi");
    const parts = text.split(re);
    return parts.map((p) => ({
      text: p,
      match: normalizeQuery(p) === nq,
    }));
  } catch {
    return [{ text, match: false }];
  }
}

type Scored = { tool: SearchableTool; score: number };

function scoreTool(query: string, tool: SearchableTool): number {
  const q = normalizeQuery(query);
  if (!q) return 0;

  const nameLower = tool.name.toLowerCase();
  const slugLower = tool.slug.toLowerCase();
  const descLower = tool.description.toLowerCase();

  let score = 0;

  if (nameLower === q) score += 200;
  else if (nameLower.startsWith(q)) score += 120;
  else if (nameLower.includes(q)) score += 80;

  if (slugLower === q) score += 100;
  else if (slugLower.startsWith(q)) score += 70;
  else if (slugLower.includes(q)) score += 50;

  if (descLower.includes(q)) score += 25;

  for (const kw of tool.keywords) {
    if (kw === q) score += 35;
    else if (kw.startsWith(q)) score += 20;
    else if (kw.includes(q)) score += 12;
  }

  const tokens = queryTokens(query);
  for (const tok of tokens) {
    if (nameLower.includes(tok)) score += 8;
    if (slugLower.includes(tok)) score += 6;
    if (tool.keywords.some((k) => k.includes(tok) || tok.includes(k)))
      score += 5;
    if (descLower.includes(tok)) score += 2;
  }

  return score;
}

/** Ranked matches (partial, case-insensitive). Max `limit` results. */
export function searchTools(
  query: string,
  tools: SearchableTool[],
  limit: number,
): SearchableTool[] {
  const q = normalizeQuery(query);
  if (!q) return [];

  const scored: Scored[] = [];
  for (const tool of tools) {
    const s = scoreTool(query, tool);
    if (s > 0) scored.push({ tool, score: s });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((x) => x.tool);
}

/** When there are zero direct hits — suggest tools by token overlap. */
export function relatedByQueryTokens(
  query: string,
  tools: SearchableTool[],
  exclude: Set<string>,
  limit: number,
): SearchableTool[] {
  const tokens = queryTokens(query);
  if (tokens.length === 0) return [];

  const scored: Scored[] = [];
  for (const tool of tools) {
    if (exclude.has(tool.slug)) continue;
    let score = 0;
    for (const tok of tokens) {
      for (const kw of tool.keywords) {
        if (kw.includes(tok) || tok.includes(kw)) score += 3;
      }
      if (tool.name.toLowerCase().includes(tok)) score += 2;
      if (tool.slug.includes(tok)) score += 2;
      if (tool.description.toLowerCase().includes(tok)) score += 1;
    }
    if (score > 0) scored.push({ tool, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((x) => x.tool);
}
