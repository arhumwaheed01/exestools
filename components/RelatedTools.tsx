import Link from "next/link";
import type { ToolId } from "@/lib/tools";

const RELATED: Record<ToolId, { href: string; label: string }[]> = {
  home: [
    { href: "/random-name-picker", label: "Random name picker" },
    { href: "/classroom-spinner", label: "Classroom spinner" },
    { href: "/prize-wheel", label: "Prize wheel" },
    { href: "/yes-no-wheel", label: "Yes or No wheel" },
  ],
  "random-name-picker": [
    { href: "/classroom-spinner", label: "Classroom / student spinner" },
    { href: "/", label: "Free spinner wheel" },
    { href: "/yes-no-wheel", label: "Yes or No decision wheel" },
    { href: "/prize-wheel", label: "Prize / giveaway wheel" },
  ],
  "classroom-spinner": [
    { href: "/random-name-picker", label: "Generic name picker" },
    { href: "/prize-wheel", label: "Classroom reward / prize wheel" },
    { href: "/", label: "All-purpose spinner wheel" },
    { href: "/yes-no-wheel", label: "Yes or No wheel" },
  ],
  "prize-wheel": [
    { href: "/random-name-picker", label: "Pick a winner by name" },
    { href: "/classroom-spinner", label: "Classroom spinner" },
    { href: "/yes-no-wheel", label: "Yes or No wheel" },
    { href: "/", label: "Spinner wheel home" },
  ],
  "yes-no-wheel": [
    { href: "/", label: "Multi-option decision wheel" },
    { href: "/random-name-picker", label: "Random name picker" },
    { href: "/prize-wheel", label: "Prize wheel" },
    { href: "/classroom-spinner", label: "Classroom spinner" },
  ],
};

export function RelatedTools({ toolId }: { toolId: ToolId }) {
  const links = RELATED[toolId];
  return (
    <nav className="max-w-3xl" aria-label="Related ExesTools spinners">
      <h2 className="text-xl font-bold tracking-tight text-foreground">Related ExesTools spinners</h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link
              href={l.href}
              className="inline-flex rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold text-foreground hover:border-accent outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
