"use client";

import { useEffect, useMemo, useState } from "react";
import { CardGrid } from "@/components/bingo/CardGrid";
import { columnRange, type BingoMode, type Card, type Cell } from "@/lib/bingo/cards";
import { canHaveFree, type GridSize } from "@/lib/bingo/list";
import type { ThemeId } from "@/lib/bingo/themes";

const PREVIEW_SEED = "PREVIEW01";

/** 75-ball preview: one sample from each real column range per row (not 1–24 in order). */
function buildBingo75PreviewCells(free: boolean): Cell[] {
  const freeIdx = free ? 12 : -1;
  const cells: Cell[] = [];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const index = r * 5 + c;
      if (index === freeIdx) {
        cells.push(null);
        continue;
      }
      const [lo] = columnRange(c);
      // Distinct sample per row within the column band
      cells.push(String(lo + r));
    }
  }
  return cells;
}

function buildPreviewCells(
  items: string[],
  size: GridSize,
  free: boolean,
  mode: BingoMode,
  max: number,
): Cell[] {
  if (mode === "bingo75") return buildBingo75PreviewCells(free);

  const freeIdx = free && canHaveFree(size) ? Math.floor((size * size) / 2) : -1;
  const need = size * size - (freeIdx >= 0 ? 1 : 0);
  const pool =
    mode === "numbers"
      ? Array.from({ length: Math.max(0, max) }, (_, i) => String(i + 1))
      : items;
  const cells: Cell[] = [];
  let i = 0;
  for (let n = 0; n < size * size; n++) {
    if (n === freeIdx) {
      cells.push(null);
      continue;
    }
    if (i < pool.length && i < need) {
      cells.push(pool[i]!);
      i++;
    } else {
      cells.push("");
    }
  }
  return cells;
}

export function PreviewCard({
  mode,
  items,
  max,
  size,
  free,
  title,
  subtitle,
  theme,
  example = false,
  caption,
}: {
  mode: BingoMode;
  items: string[];
  max: number;
  size: GridSize;
  free: boolean;
  title: string;
  subtitle: string;
  theme: ThemeId;
  example?: boolean;
  caption?: string;
}) {
  const [debounced, setDebounced] = useState({
    mode,
    items,
    max,
    size,
    free,
    title,
    subtitle,
    theme,
  });

  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebounced({ mode, items, max, size, free, title, subtitle, theme });
    }, 150);
    return () => window.clearTimeout(t);
  }, [mode, items, max, size, free, title, subtitle, theme]);

  const card: Card = useMemo(() => {
    const cells = buildPreviewCells(
      debounced.items,
      debounced.size,
      debounced.free,
      debounced.mode,
      debounced.max,
    );
    return { number: 1, cells };
  }, [debounced]);

  return (
    <div className="min-w-0">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Preview</p>
      <div className="mx-auto w-full max-w-[20rem] min-w-0">
        <CardGrid
          card={card}
          size={debounced.size}
          mode={debounced.mode}
          title={debounced.title || "Bingo"}
          subtitle={debounced.subtitle}
          seed={PREVIEW_SEED}
          theme={debounced.theme}
          preview
          example={example}
        />
      </div>
      <p className="mt-2 text-center text-xs text-muted">
        {caption ??
          (example
            ? "Example: pick a theme or type your own list."
            : "Each card gets a different mix.")}
      </p>
    </div>
  );
}
