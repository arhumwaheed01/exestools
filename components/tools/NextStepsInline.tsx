"use client";

import Link from "next/link";
import { RefreshCw, X } from "lucide-react";
import type { ToolId } from "@/lib/tools";

const RELATED: Record<ToolId, { href: string; label: string }[]> = {
  home: [
    { href: "/random-name-picker", label: "Random Name Picker" },
    { href: "/classroom-spinner", label: "Classroom spinner" },
    { href: "/prize-wheel", label: "Prize wheel" },
    { href: "/yes-no-wheel", label: "Yes or no wheel" },
    { href: "/random-team-generator", label: "Random Team Generator" },
    { href: "/secret-santa-generator", label: "Secret Santa generator" },
  ],
  "random-name-picker": [
    { href: "/classroom-spinner", label: "Classroom / student spinner" },
    { href: "/random-team-generator", label: "Random team generator" },
    { href: "/secret-santa-generator", label: "Secret Santa generator" },
    { href: "/", label: "Free spinner wheel" },
    { href: "/prize-wheel", label: "Prize / giveaway wheel" },
  ],
  "classroom-spinner": [
    { href: "/random-name-picker", label: "Generic name picker" },
    { href: "/random-team-generator", label: "Split the class into groups" },
    { href: "/prize-wheel", label: "Classroom reward / prize wheel" },
    { href: "/", label: "All-purpose spinner wheel" },
  ],
  "prize-wheel": [
    { href: "/random-name-picker", label: "Pick a winner by name" },
    { href: "/classroom-spinner", label: "Classroom spinner" },
    { href: "/raffle-generator", label: "Raffle generator" },
    { href: "/", label: "Spinner wheel home" },
  ],
  "yes-no-wheel": [
    { href: "/", label: "Multi-option decision wheel" },
    { href: "/random-name-picker", label: "Random name picker" },
    { href: "/prize-wheel", label: "Prize wheel" },
  ],
  "random-team-generator": [
    { href: "/classroom-spinner", label: "Classroom spinner" },
    { href: "/random-name-picker", label: "Random name picker" },
    { href: "/", label: "Spinner wheel" },
  ],
  "secret-santa-generator": [
    { href: "/random-name-picker", label: "Random name picker" },
    { href: "/random-team-generator", label: "Random team generator" },
    { href: "/", label: "Free spinner wheel" },
  ],
  "random-number-wheel": [
    { href: "/", label: "Spinner wheel" },
    { href: "/classroom-spinner", label: "Classroom spinner" },
    { href: "/raffle-generator", label: "Raffle generator" },
  ],
  "raffle-generator": [
    { href: "/prize-wheel", label: "Prize wheel" },
    { href: "/random-name-picker", label: "Random name picker" },
    { href: "/", label: "Free spinner wheel" },
  ],
  "bingo-card-generator": [
    { href: "/random-number-wheel", label: "Random number wheel" },
    { href: "/classroom-spinner", label: "Classroom spinner" },
    { href: "/", label: "Free spinner wheel" },
  ],
};

type Props = {
  open: boolean;
  toolId: ToolId;
  onClose: () => void;
  onSpinAgain: () => void;
};

/** Compact related-tools strip under the wheel — no second dialog after the winner popup. */
export function NextStepsInline({ open, toolId, onClose, onSpinAgain }: Props) {
  if (!open) return null;
  const links = RELATED[toolId] ?? RELATED.home;

  return (
    <section
      className="rounded-2xl border border-border bg-surface px-3 py-2.5 sm:px-4"
      aria-label="Next steps"
    >
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-muted">Next steps</p>
        <button
          type="button"
          onClick={onSpinAgain}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-accent-strong px-3 text-xs font-bold text-slate-950 outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-accent"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden />
          Spin again
        </button>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Hide next steps"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {links.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="inline-flex min-h-9 items-center rounded-lg border border-border bg-surface-2 px-2.5 text-xs font-semibold text-foreground outline-none hover:border-accent focus-visible:ring-2 focus-visible:ring-accent"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
