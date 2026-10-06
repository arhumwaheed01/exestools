"use client";

import dynamic from "next/dynamic";

const RaffleTool = dynamic(
  () => import("@/components/raffle/RaffleTool").then((m) => m.RaffleTool),
  {
    ssr: false,
    loading: () => (
      <div
        className="min-h-[620px] animate-pulse rounded-3xl border border-border bg-surface p-5"
        aria-hidden
      />
    ),
  },
);

/** Client tool with fixed min-height to avoid CLS. */
export function RaffleMount() {
  return (
    <div className="min-h-[620px] min-w-0">
      <RaffleTool />
    </div>
  );
}
