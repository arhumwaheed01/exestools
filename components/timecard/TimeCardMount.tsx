"use client";

import dynamic from "next/dynamic";
import { ToolSkeleton } from "@/components/tools/ToolSkeleton";

const TimeCardTool = dynamic(
  () => import("@/components/timecard/TimeCardTool").then((m) => m.TimeCardTool),
  {
    ssr: false,
    loading: () => <ToolSkeleton variant="raffle" />,
  },
);

export function TimeCardMount() {
  return (
    <div className="min-h-[640px] min-w-0">
      <TimeCardTool />
    </div>
  );
}
