"use client";

import { useCallback, useId, useRef, useState } from "react";
import {
  BINGO_LETTERS,
  FREE,
  cellLabel,
  type BingoMode,
  type Card,
  type Cell,
} from "@/lib/bingo/cards";
import type { GridSize } from "@/lib/bingo/list";

export function longestItemLength(cells: readonly Cell[]): number {
  let max = 0;
  for (const c of cells) {
    if (c === null) continue;
    max = Math.max(max, [...c].length);
  }
  return max;
}

/** Screen font steps by longest item (§4.5). One step smaller for 5×5 under 400px. */
export function cellFontClass(longest: number, size: GridSize = 5): string {
  if (size === 5) {
    // Narrow phones: keep labels inside the cell without mid-word shatter.
    if (longest <= 8) return "text-xs max-[399px]:text-[11px] sm:text-sm";
    if (longest <= 16) return "text-[11px] max-[399px]:text-[10px] sm:text-xs";
    if (longest <= 28) return "text-[10px] max-[399px]:text-[9px] sm:text-[11px]";
    return "text-[10px] max-[399px]:text-[9px]";
  }
  if (longest <= 8) return "text-base sm:text-lg";
  if (longest <= 16) return "text-sm";
  if (longest <= 28) return "text-xs";
  return "text-[11px]";
}

/** Min cell height — square-ish, but allowed to grow with wrapped labels. */
function cellMinHeightClass(size: GridSize): string {
  if (size === 5) return "min-h-[3.25rem] max-[399px]:min-h-[2.85rem] sm:min-h-[3.75rem]";
  if (size === 4) return "min-h-[4rem] sm:min-h-[4.5rem]";
  return "min-h-[5rem] sm:min-h-[5.5rem]";
}

/** Print font in pt (§4.5); never below 9. */
export function cellFontPt(longest: number): number {
  if (longest <= 8) return 12;
  if (longest <= 16) return 10;
  if (longest <= 28) return 9;
  return 9;
}

function CellInner({
  cell,
  marked,
  highlight,
  font,
  size,
  interactive,
  tabIndex,
  buttonRef,
  onClick,
  onKeyDown,
}: {
  cell: Cell;
  marked: boolean;
  highlight: boolean;
  font: string;
  size: GridSize;
  interactive: boolean;
  tabIndex: number;
  buttonRef?: (el: HTMLButtonElement | null) => void;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}) {
  const isFree = cell === null;
  const label = cellLabel(cell);
  // No aspect-square: fixed squares clip/overflow multi-line labels on narrow 5×5.
  // Rows share height via the grid; cells grow with wrapped text.
  const base =
    `relative flex h-full w-full min-h-0 min-w-0 items-center justify-center border border-foreground/70 px-0.5 py-1 text-center leading-snug wrap-break-word hyphens-auto ${cellMinHeightClass(size)}`;
  const freeBg = isFree ? "bg-accent/15" : "";
  const markedBg = marked && !isFree ? "bg-surface-2" : "";
  const hlRing = highlight ? "ring-2 ring-inset ring-accent-strong" : "";

  if (interactive) {
    return (
      <button
        ref={buttonRef}
        type="button"
        tabIndex={tabIndex}
        aria-pressed={marked}
        aria-label={isFree ? "Free square, marked" : marked ? `${label}, marked` : label}
        onClick={isFree ? undefined : onClick}
        onKeyDown={onKeyDown}
        className={`${base} ${font} outline-none focus-visible:ring-2 focus-visible:ring-accent ${freeBg} ${markedBg} ${hlRing}`}
      >
        <span className="max-w-full wrap-break-word hyphens-auto">{isFree ? FREE : label}</span>
        {marked && !isFree ? (
          <span
            aria-hidden
            className="absolute right-0.5 top-0.5 text-[10px] font-bold text-accent-strong"
          >
            ✓
          </span>
        ) : null}
      </button>
    );
  }

  return (
    <div
      aria-label={isFree ? "Free square, marked" : label}
      className={`${base} ${font} ${freeBg} ${markedBg} ${hlRing}`}
    >
      <span className="max-w-full wrap-break-word hyphens-auto">{isFree ? FREE : label}</span>
      {marked && !isFree ? (
        <span
          aria-hidden
          className="absolute right-0.5 top-0.5 text-[10px] font-bold text-accent-strong"
        >
          ✓
        </span>
      ) : null}
    </div>
  );
}

export function CardGrid({
  card,
  size,
  mode,
  title,
  subtitle,
  seed,
  interactive = false,
  marks,
  onToggle,
  highlightCells,
  compact = false,
  className = "",
}: {
  card: Card;
  size: GridSize;
  mode: BingoMode;
  title: string;
  subtitle?: string;
  seed: string;
  interactive?: boolean;
  marks?: boolean[];
  onToggle?: (index: number) => void;
  highlightCells?: readonly number[];
  compact?: boolean;
  className?: string;
}) {
  const labelId = useId();
  const longest = longestItemLength(card.cells);
  const font = cellFontClass(longest, size);
  const highlight = new Set(highlightCells ?? []);
  const [focusIdx, setFocusIdx] = useState(0);
  const cellRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const moveFocus = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(size * size - 1, next));
      setFocusIdx(clamped);
      // Defer so tabIndex updates before focus
      window.requestAnimationFrame(() => cellRefs.current[clamped]?.focus());
    },
    [size],
  );

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (!interactive) return;
    const row = Math.floor(index / size);
    const col = index % size;
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        moveFocus(row * size + Math.min(size - 1, col + 1));
        break;
      case "ArrowLeft":
        e.preventDefault();
        moveFocus(row * size + Math.max(0, col - 1));
        break;
      case "ArrowDown":
        e.preventDefault();
        moveFocus(Math.min(size - 1, row + 1) * size + col);
        break;
      case "ArrowUp":
        e.preventDefault();
        moveFocus(Math.max(0, row - 1) * size + col);
        break;
      case "Home":
        e.preventDefault();
        if (e.ctrlKey) moveFocus(0);
        else moveFocus(row * size);
        break;
      case "End":
        e.preventDefault();
        if (e.ctrlKey) moveFocus(size * size - 1);
        else moveFocus(row * size + size - 1);
        break;
      case " ":
      case "Enter": {
        e.preventDefault();
        if (card.cells[index] === null) return;
        onToggle?.(index);
        break;
      }
      default:
        break;
    }
  };

  const seedSpoken = [...seed].join(" ");
  const rows = Array.from({ length: size }, (_, r) => r);

  return (
    <article
      lang="en"
      className={`bingo-card flex h-auto min-w-0 flex-col border-2 border-foreground bg-background text-foreground ${
        compact ? "p-2" : "p-3 sm:p-4"
      } ${className}`}
    >
      <h3
        id={labelId}
        className={`min-w-0 wrap-break-word text-center font-bold leading-tight hyphens-auto ${
          compact ? "text-sm" : "text-base sm:text-lg"
        }`}
      >
        {title || "Bingo"}
      </h3>
      {subtitle ? (
        <p
          className={`mt-0.5 min-w-0 wrap-break-word text-center leading-tight text-muted hyphens-auto ${
            compact ? "text-[11px]" : "text-xs sm:text-sm"
          }`}
        >
          {subtitle}
        </p>
      ) : null}

      <div
        role="grid"
        aria-labelledby={labelId}
        className="mt-2 flex w-full min-w-0 flex-col"
      >
        {mode === "bingo75" ? (
          <div
            role="row"
            className="grid min-w-0"
            style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
          >
            {BINGO_LETTERS.map((letter) => (
              <div
                key={letter}
                role="columnheader"
                className="flex items-center justify-center border border-foreground/70 bg-surface-2 py-1 text-center text-sm font-bold"
              >
                {letter}
              </div>
            ))}
          </div>
        ) : null}

        {rows.map((r) => (
          <div
            key={r}
            role="row"
            className="grid min-w-0 items-stretch"
            style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: size }, (_, c) => {
              const index = r * size + c;
              const cell = card.cells[index]!;
              const isFree = cell === null;
              const marked = isFree || Boolean(marks?.[index]);
              return (
                <div key={index} role="gridcell" className="min-h-0 min-w-0">
                  <CellInner
                    cell={cell}
                    marked={marked}
                    highlight={highlight.has(index)}
                    font={font}
                    size={size}
                    interactive={interactive}
                    tabIndex={interactive && focusIdx === index ? 0 : -1}
                    buttonRef={(el) => {
                      cellRefs.current[index] = el;
                    }}
                    onClick={() => onToggle?.(index)}
                    onKeyDown={(e) => onKeyDown(e, index)}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <p
        className={`mt-2 shrink-0 text-center text-muted ${compact ? "text-[10px]" : "text-xs"}`}
      >
        Card {card.number}
        {" · "}
        <span className="font-mono" aria-label={`Set code ${seedSpoken}`}>
          Set {seed}
        </span>
        {!compact ? (
          <span className="hidden min-[400px]:inline whitespace-nowrap">
            {" · "}
            exestools.com/bingo-card-generator
          </span>
        ) : null}
      </p>
    </article>
  );
}
