import Link from "next/link";
import { relatedLinksFor } from "@/components/RelatedTools";
import { getPublishedGuides } from "@/lib/guides";
import { TOOLS, type ToolId } from "@/lib/tools";

function pathForToolId(toolId: ToolId): string {
  return TOOLS.find((t) => t.id === toolId)?.path ?? `/${toolId}`;
}

function liveGuidesForTool(toolPath: string) {
  return getPublishedGuides().filter((g) =>
    (g.frontmatter.related_tools ?? []).includes(toolPath),
  );
}

const MAX_LINKS = 6;

/**
 * Single related-links block above FAQ (one H2, at most 6 links):
 * /guides hub + up to 2 live guides that list this tool + related tools to fill the rest.
 */
export function RelatedLinks({ toolId }: { toolId: ToolId }) {
  if (toolId === "home") return null;

  const toolPath = pathForToolId(toolId);
  // One merged block, at most MAX_LINKS links: hub + up to 2 guides + related tools.
  const guides = liveGuidesForTool(toolPath).slice(0, 2);
  const tools = relatedLinksFor(toolId).slice(0, MAX_LINKS - 1 - guides.length);

  return (
    <nav className="max-w-3xl" aria-label="Related guides and tools">
      <h2 className="text-xl font-bold tracking-tight text-foreground">Related guides and tools</h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        <li>
          <Link
            href="/guides"
            className="inline-flex min-h-11 items-center rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold text-foreground hover:border-accent outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Guides
          </Link>
        </li>
        {guides.map((g) => (
          <li key={g.slug}>
            <Link
              href={`/guides/${g.slug}`}
              className="inline-flex min-h-11 items-center rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold text-foreground hover:border-accent outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {g.title}
            </Link>
          </li>
        ))}
        {tools.map((l) => (
          <li key={l.href + l.label}>
            <Link
              href={l.href}
              className="inline-flex min-h-11 items-center rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold text-foreground hover:border-accent outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
