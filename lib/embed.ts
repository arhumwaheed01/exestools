import type { ToolId } from "@/lib/tools";
import { TOOLS } from "@/lib/tools";

/** URL segment under /embed/[tool] for SpinnerWheel-based tools. */
export const EMBED_TOOL_SLUGS = [
  "spinner",
  "random-name-picker",
  "classroom-spinner",
  "prize-wheel",
  "yes-no-wheel",
] as const;

export type EmbedToolSlug = (typeof EMBED_TOOL_SLUGS)[number];

const SLUG_TO_TOOL: Record<EmbedToolSlug, ToolId> = {
  spinner: "home",
  "random-name-picker": "random-name-picker",
  "classroom-spinner": "classroom-spinner",
  "prize-wheel": "prize-wheel",
  "yes-no-wheel": "yes-no-wheel",
};

export function isEmbedToolSlug(value: string): value is EmbedToolSlug {
  return (EMBED_TOOL_SLUGS as readonly string[]).includes(value);
}

export function embedToolId(slug: EmbedToolSlug): ToolId {
  return SLUG_TO_TOOL[slug];
}

export function embedSlugForToolId(toolId: ToolId): EmbedToolSlug | null {
  const entry = (Object.entries(SLUG_TO_TOOL) as [EmbedToolSlug, ToolId][]).find(
    ([, id]) => id === toolId,
  );
  return entry?.[0] ?? null;
}

export function embedToolLabel(slug: EmbedToolSlug): string {
  const id = embedToolId(slug);
  return TOOLS.find((t) => t.id === id)?.footerLabel ?? "ExesTools wheel";
}

/** Allow any parent site to iframe /embed/* (Google Sites, Notion, blogs, etc.). */
export const EMBED_FRAME_CSP = "frame-ancestors *";

export function buildEmbedIframeSnippet(origin: string, slug: EmbedToolSlug, hash: string): string {
  const src = `${origin.replace(/\/$/, "")}/embed/${slug}${hash.startsWith("#") ? hash : hash ? `#${hash}` : ""}`;
  return `<iframe src="${src}" width="100%" height="520" title="ExesTools wheel" style="border:0;max-width:100%;" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
}
