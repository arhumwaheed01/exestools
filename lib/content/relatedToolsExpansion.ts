/**
 * Ensures each tool page exposes enough internal links for SEO (5–10 related tools).
 */

import { DEVELOPER_CATEGORY_SLUGS } from "./developerToolsData";
import { IMAGE_CATEGORY_SLUGS } from "./imageToolsData";
import { allTools, getToolBySlug } from "./textToolsData";
import { toolCatalog } from "./toolCatalog";

export const RELATED_TOOLS_MIN = 5;
export const RELATED_TOOLS_MAX = 10;

const textOrder = toolCatalog.map((t) => t.slug);
const devOrder = [...DEVELOPER_CATEGORY_SLUGS] as string[];
const imageOrder = [...IMAGE_CATEGORY_SLUGS] as string[];

function orderedPoolForSlug(slug: string): string[] {
  if (devOrder.includes(slug)) return devOrder;
  if (imageOrder.includes(slug)) return imageOrder;
  return textOrder;
}

/**
 * Deduped related slugs: seed order first, then same-category pool, then global catalog.
 */
export function getExpandedRelatedSlugs(
  slug: string,
  seed: readonly string[],
): string[] {
  const pool = orderedPoolForSlug(slug);
  const out: string[] = [];
  const seen = new Set<string>();

  const push = (s: string) => {
    if (s === slug || seen.has(s) || !getToolBySlug(s)) return;
    seen.add(s);
    out.push(s);
  };

  for (const s of seed) {
    push(s);
    if (out.length >= RELATED_TOOLS_MAX) return out;
  }

  for (const s of pool) {
    push(s);
    if (out.length >= RELATED_TOOLS_MAX) return out;
  }

  for (const t of allTools) {
    push(t.slug);
    if (out.length >= RELATED_TOOLS_MAX) return out;
  }

  return out.slice(0, RELATED_TOOLS_MAX);
}
