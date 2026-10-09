"use client";

import { useEffect, useMemo, useState } from "react";
import { CardGrid } from "@/components/bingo/CardGrid";
import type { BingoMode, Card, Cell } from "@/lib/bingo/cards";
import { canHaveFree, type GridSize } from "@/lib/bingo/list";
import type { ThemeId } from "@/lib/bingo/themes";

const PREVIEW_SEED = "PREVIEW01";

function buildPreviewCells(
  items: string[],
  size: GridSize,
  free: boolean,
  mode: BingoMode,
  max: number,
): Cell[] {
  const freeIdx = free && canHaveFree(size) ? Math.floor((size * size) / 2) : -1;
  const need = size * size - (freeIdx >= 0 ? 1 : 0);
  let pool: string[] = [];
  if (mode === "bingo75") {
    pool = Array.from({ length: 75 }, (_, i) => String(i + 1));
  } else if (mode === "numbers") {
    pool = Array.from({ length: Math.max(0, max) }, (_, i) => String(i + 1));
  } else {
    pool = items;
  }
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
