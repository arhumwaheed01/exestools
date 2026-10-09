"use client";

import dynamic from "next/dynamic";

const BingoTool = dynamic(
  () => import("@/components/bingo/BingoTool").then((m) => m.BingoTool),
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

/** Client tool with fixed min-height to avoid CLS. Print root is appended to document.body. */
export function BingoMount() {
  return (
    <div className="min-h-[620px] min-w-0">
      <BingoTool />
    </div>
  );
}
