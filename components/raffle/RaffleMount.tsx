"use client";

import dynamic from "next/dynamic";
import { ToolSkeleton } from "@/components/tools/ToolSkeleton";

const RaffleTool = dynamic(
  () => import("@/components/raffle/RaffleTool").then((m) => m.RaffleTool),
  {
    ssr: false,
    loading: () => <ToolSkeleton variant="raffle" />,
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
