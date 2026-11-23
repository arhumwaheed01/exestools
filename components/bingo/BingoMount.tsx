"use client";

import { BingoTool } from "@/components/bingo/BingoTool";

/** Client tool with fixed min-height to avoid CLS. SSR-renders the real form. */
export function BingoMount() {
  return (
    <div className="min-h-[620px] min-w-0">
      <BingoTool />
    </div>
  );
}
