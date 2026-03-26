/**
 * Sidebar content for legal / informational pages only.
 */

import { homepageData } from "./homepageData";
import { getToolBySlug } from "./textToolsData";

const EXTRA_SLUGS = [
  "uppercase-converter",
  "lowercase-converter",
  "remove-extra-spaces",
] as const;

const MAX_POPULAR = 8;

export function getLegalSidebarPopularTools(): { name: string; slug: string }[] {
  const seen = new Set<string>();
  const out: { name: string; slug: string }[] = [];
  for (const slug of [...homepageData.popularToolSlugs, ...EXTRA_SLUGS]) {
    if (seen.has(slug)) continue;
    const t = getToolBySlug(slug);
    if (!t) continue;
    seen.add(slug);
    out.push({ name: t.name, slug: t.slug });
    if (out.length >= MAX_POPULAR) break;
  }
  return out;
}

export const legalSidebarUsefulLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
  { label: "Contact", href: "/contact" },
] as const;
