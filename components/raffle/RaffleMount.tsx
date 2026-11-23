"use client";

import { RaffleTool } from "@/components/raffle/RaffleTool";

/** Client tool with fixed min-height to avoid CLS. SSR-renders the real form. */
export function RaffleMount() {
  return (
    <div className="min-h-[620px] min-w-0">
      <RaffleTool />
    </div>
  );
}
