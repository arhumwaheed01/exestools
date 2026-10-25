"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { NumberWheelMount } from "@/components/number/NumberWheelMount";
import { SpinnerMount } from "@/components/SpinnerMount";
import { TeamGeneratorMount } from "@/components/teams/TeamGeneratorMount";
import { ALLOWED_NUMBER_PRESET_QUERY } from "@/lib/range";
import type { ToolId } from "@/lib/tools";

/** Empty shell only — never put a wheel/copy here (avoids duplicate crawl text). */
function MountSlot({ className }: { className: string }) {
  return <div className={className} aria-hidden />;
}

const WHEEL_FIRST_TOOLS: ReadonlySet<ToolId> = new Set([
  "home",
  "random-name-picker",
  "prize-wheel",
  "classroom-spinner",
  "yes-no-wheel",
]);

function SpinnerFromQuery({ toolId }: { toolId: ToolId }) {
  const sp = useSearchParams();
  const c = sp.get("c");
  const preset = sp.get("preset");
  return (
    <SpinnerMount
      toolId={toolId}
      initialEncoded={c}
      initialPresetQuery={preset}
      layout={WHEEL_FIRST_TOOLS.has(toolId) ? "wheel-first" : "classic"}
    />
  );
}

/** Client-reads `?c=` / `?preset=` so the server page can stay static. */
export function QueryHydratedSpinner({ toolId }: { toolId: ToolId }) {
  const tall = WHEEL_FIRST_TOOLS.has(toolId);
  return (
    <Suspense fallback={<MountSlot className={tall ? "min-h-[min(70svh,36rem)]" : "min-h-[520px]"} />}>
      <SpinnerFromQuery toolId={toolId} />
    </Suspense>
  );
}

function TeamsFromQuery() {
  const sp = useSearchParams();
  const preset = sp.get("preset") === "pairs" ? "pairs" : null;
  return <TeamGeneratorMount initialPresetQuery={preset} />;
}

export function QueryHydratedTeams() {
  return (
    <Suspense fallback={<MountSlot className="min-h-[1190px] lg:min-h-[800px]" />}>
      <TeamsFromQuery />
    </Suspense>
  );
}

function NumbersFromQuery() {
  const sp = useSearchParams();
  const raw = sp.get("preset");
  const preset = raw && ALLOWED_NUMBER_PRESET_QUERY.has(raw) ? raw : null;
  return <NumberWheelMount initialPresetQuery={preset} />;
}

export function QueryHydratedNumbers() {
  return (
    <Suspense fallback={<MountSlot className="min-h-[640px] lg:min-h-[560px]" />}>
      <NumbersFromQuery />
    </Suspense>
  );
}
