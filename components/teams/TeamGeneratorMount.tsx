"use client";

import { TeamGenerator } from "@/components/teams/TeamGenerator";

type Props = {
  initialPresetQuery?: string | null;
};

/** SSR-renders the real team form. Fixed min-height avoids CLS. */
export function TeamGeneratorMount({ initialPresetQuery = null }: Props) {
  return (
    <div className="min-h-[1190px] lg:min-h-[800px]">
      <TeamGenerator initialPresetQuery={initialPresetQuery} />
    </div>
  );
}
