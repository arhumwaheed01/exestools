"use client";

import { TimeCardTool } from "@/components/timecard/TimeCardTool";

/** Client tool with fixed min-height to avoid CLS. SSR-renders the real form. */
export function TimeCardMount() {
  return (
    <div className="min-h-[640px] min-w-0">
      <TimeCardTool />
    </div>
  );
}
