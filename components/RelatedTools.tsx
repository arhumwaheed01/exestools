import Link from "next/link";
import type { ToolId } from "@/lib/tools";

const RELATED: Record<ToolId, { href: string; label: string }[]> = {
  home: [
    { href: "/random-name-picker", label: "Random name picker" },
    { href: "/classroom-spinner", label: "Classroom spinner" },
    { href: "/prize-wheel", label: "Prize wheel" },
    { href: "/yes-no-wheel", label: "Yes or no wheel" },
    { href: "/random-team-generator", label: "Random team generator" },
  ],
  "random-name-picker": [
    { href: "/classroom-spinner", label: "Classroom / student spinner" },
    { href: "/random-team-generator", label: "Random team generator" },
    { href: "/", label: "Free spinner wheel" },
    { href: "/yes-no-wheel", label: "Yes or no wheel" },
    { href: "/prize-wheel", label: "Prize / giveaway wheel" },
  ],
  "classroom-spinner": [
    { href: "/random-name-picker", label: "Generic name picker" },
    { href: "/random-team-generator", label: "Split the class into groups" },
    { href: "/prize-wheel", label: "Classroom reward / prize wheel" },
    { href: "/", label: "All-purpose spinner wheel" },
    { href: "/yes-no-wheel", label: "Yes or no wheel" },
  ],
  "prize-wheel": [
    { href: "/random-name-picker", label: "Pick a winner by name" },
    { href: "/classroom-spinner", label: "Classroom spinner" },
    { href: "/yes-no-wheel", label: "Yes or no wheel" },
    { href: "/", label: "Spinner wheel home" },
  ],
  "yes-no-wheel": [
    { href: "/", label: "Multi-option decision wheel" },
    { href: "/random-name-picker", label: "Random name picker" },
    { href: "/prize-wheel", label: "Prize wheel" },
    { href: "/classroom-spinner", label: "Classroom spinner" },
  ],
  "random-team-generator": [
    { href: "/classroom-spinner", label: "Classroom spinner (pick one student)" },
    { href: "/random-name-picker", label: "Random name picker" },
    { href: "/", label: "Spinner wheel" },
  ],
};

export function relatedLinksFor(toolId: ToolId) {
  return RELATED[toolId];
}

export function RelatedTools({
  toolId,
  heading = "Related ExesTools tools",
  compact = false,
}: {
  toolId: ToolId;
  heading?: string;
  compact?: boolean;
}) {
  const links = RELATED[toolId];
  return (
    <nav className={compact ? "max-w-3xl" : "max-w-3xl"} aria-label="Related ExesTools tools">
      <h2
        className={
          compact
            ? "text-base font-bold tracking-tight text-foreground"
            : "text-xl font-bold tracking-tight text-foreground"
        }
      >
        {heading}
      </h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {links.map((l) => (
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
