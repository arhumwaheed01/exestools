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

/**
 * SEO box above FAQ: /guides hub + any live guide that lists this tool + 3 related tools.
 */
export function RelatedLinks({ toolId }: { toolId: ToolId }) {
  if (toolId === "home") return null;

  const toolPath = pathForToolId(toolId);
  const guides = liveGuidesForTool(toolPath);
  const tools = relatedLinksFor(toolId).slice(0, 3);

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
