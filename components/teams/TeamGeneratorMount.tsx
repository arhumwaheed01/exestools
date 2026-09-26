"use client";

import dynamic from "next/dynamic";
import { TEAM_SAMPLE_NAMES } from "@/lib/teams";

function ExampleSplit() {
  const left = TEAM_SAMPLE_NAMES.slice(0, 6);
  const right = TEAM_SAMPLE_NAMES.slice(6, 12);
  return (
    <div className="rounded-2xl border border-border bg-surface p-4" aria-label="Example split">
      <p className="text-sm font-semibold text-foreground">Example split</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border p-3">
          <p className="font-bold text-foreground">Team 1 (6)</p>
          <ul className="mt-1 text-sm text-muted">
            {left.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-border p-3">
          <p className="font-bold text-foreground">Team 2 (6)</p>
          <ul className="mt-1 text-sm text-muted">
            {right.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

const TeamGenerator = dynamic(
  () => import("@/components/teams/TeamGenerator").then((m) => m.TeamGenerator),
  { ssr: false, loading: () => <ExampleSplit /> },
);

type Props = {
  initialPresetQuery?: string | null;
};

/** SSR example split (crawlers / loading) + client tool. Fixed min-height avoids CLS. */
export function TeamGeneratorMount({ initialPresetQuery = null }: Props) {
  return (
    <div className="min-h-[520px]">
      <TeamGenerator initialPresetQuery={initialPresetQuery} />
    </div>
  );
}
