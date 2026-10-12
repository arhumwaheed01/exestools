"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { NumberWheelMount } from "@/components/number/NumberWheelMount";
import { SpinnerMount } from "@/components/SpinnerMount";
import { TeamGeneratorMount } from "@/components/teams/TeamGeneratorMount";
import { ALLOWED_NUMBER_PRESET_QUERY } from "@/lib/range";
import type { ToolId } from "@/lib/tools";

function SpinnerFromQuery({ toolId }: { toolId: ToolId }) {
  const sp = useSearchParams();
  const c = sp.get("c");
  const preset = sp.get("preset");
  return (
    <SpinnerMount
      toolId={toolId}
      initialEncoded={c}
      initialPresetQuery={preset}
    />
  );
}

/** Client-reads `?c=` / `?preset=` so the server page can stay static. */
export function QueryHydratedSpinner({ toolId }: { toolId: ToolId }) {
  return (
    <Suspense fallback={<SpinnerMount toolId={toolId} />}>
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
    <Suspense fallback={<TeamGeneratorMount />}>
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
    <Suspense fallback={<NumberWheelMount />}>
      <NumbersFromQuery />
    </Suspense>
  );
}
