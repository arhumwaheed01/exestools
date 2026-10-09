"use client";

import { useCallback, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  BINGO_LETTERS,
  FREE,
  cellLabel,
  type BingoMode,
  type Card,
  type Cell,
} from "@/lib/bingo/cards";
import type { GridSize } from "@/lib/bingo/list";
import type { ThemeId } from "@/lib/bingo/themes";

export function longestItemLength(cells: readonly Cell[]): number {
  let max = 0;
  for (const c of cells) {
    if (c === null) continue;
    max = Math.max(max, [...c].length);
  }
  return max;
}

/** Screen font steps by longest item on this card. */
export function cellFontClass(longest: number, size: GridSize = 5): string {
  if (size === 5) {
    if (longest <= 8) return "text-[clamp(.95rem,3.8vw,1.15rem)] max-[399px]:text-[11px]";
    if (longest <= 16) return "text-sm max-[399px]:text-xs";
    if (longest <= 28) return "text-xs max-[399px]:text-[11px]";
    return "text-[11px] max-[399px]:text-[10px]";
  }
  if (longest <= 8) return "text-[clamp(.95rem,3.8vw,1.15rem)]";
  if (longest <= 16) return "text-sm";
  if (longest <= 28) return "text-xs";
  return "text-[11px]";
}

/** Print font in pt; never below 9. */
export function cellFontPt(longest: number): number {
  if (longest <= 8) return 12;
  if (longest <= 16) return 10;
  if (longest <= 28) return 9;
  return 9;
}

type FreeIcon = "star" | "snowflake" | "moon" | "heart";

const FREE_ICON_FOR: Record<ThemeId, FreeIcon> = {
  classic: "star",
  festive: "snowflake",
  spooky: "moon",
  pastel: "heart",
  classroom: "star",
  harvest: "star",
  party: "star",
  trip: "star",
};

function FreeGlyph({ kind }: { kind: FreeIcon }) {
  const common = "bc-free-icon size-6 text-[var(--bc-free-ink)]";
  if (kind === "heart") {
    return (
      <svg aria-hidden className={common} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21s-6.7-4.4-9.3-8.2C.7 9.8 1.6 6.2 4.6 5.1c1.9-.7 3.9.1 5.1 1.6C11 5.2 13 4.4 14.9 5.1c3 .1 3.9 4.7 1.9 7.7C18.7 16.6 12 21 12 21z" />
      </svg>
    );
  }
  if (kind === "moon") {
    return (
      <svg aria-hidden className={common} viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.5 2.1a9.8 9.8 0 0 0-1.2.1A9 9 0 1 0 21 15.7a8 8 0 0 1-5.5-13.6z" />
      </svg>
    );
  }
  if (kind === "snowflake") {
    return (
      <svg aria-hidden className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M12 2v20M4.5 6.5l15 11M19.5 6.5l-15 11M2 12h20" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg aria-hidden className={common} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6z" />
    </svg>
  );
}

function CellInner({
  cell,
  marked,
  highlight,
  font,
  isNumber,
  freeIcon,
  interactive,
  tabIndex,
  buttonRef,
  onClick,
  onKeyDown,
  placeholder,
}: {
  cell: Cell;
  marked: boolean;
  highlight: boolean;
  font: string;
  isNumber: boolean;
  freeIcon: FreeIcon;
  interactive: boolean;
  tabIndex: number;
  buttonRef?: (el: HTMLButtonElement | null) => void;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: boolean;
}) {
  const isFree = cell === null;
  const label = cellLabel(cell);
  const win = highlight ? "bc-win-cell" : "";
  const base =
    `bc-cell relative aspect-square grid min-h-11 min-w-0 place-items-center rounded-md p-1 text-center font-semibold leading-tight wrap-break-word hyphens-auto outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bc-cell)] ${
      placeholder
        ? "border border-dashed border-[var(--bc-line)] bg-transparent text-[var(--bc-line)]"
        : isFree
          ? "bg-[var(--bc-free)] text-[var(--bc-free-ink)]"
          : "bg-[var(--bc-cell)] text-[var(--bc-cell-ink)]"
    }`;

  const body: ReactNode = placeholder ? (
    <span className="text-lg font-bold text-[var(--bc-line)]" aria-hidden>
      ?
    </span>
  ) : isFree ? (
    <span className="relative z-10 flex flex-col items-center gap-0.5 text-[var(--bc-free-ink)]">
      <FreeGlyph kind={freeIcon} />
      <span className="text-[10px] font-black tracking-[0.18em]">{FREE}</span>
    </span>
  ) : (
    <span
      className={`relative z-10 line-clamp-4 max-w-full wrap-break-word hyphens-auto ${
        marked ? "font-extrabold" : ""
      } ${isNumber ? "tabular-nums text-[clamp(1.1rem,5.5vw,1.6rem)] font-bold" : font}`}
    >
      {label}
    </span>
  );

  const dauber =
    marked && !isFree && !placeholder ? (
      <>
        <span
          aria-hidden
          className="bc-dauber pointer-events-none absolute inset-[10%] rounded-[47%_53%_50%_50%/52%_48%_52%_48%] bg-[var(--bc-dauber)] ring-2 ring-[color-mix(in_srgb,var(--bc-dauber),black_25%)]"
        />
        <span
          aria-hidden
          className="absolute right-1 top-1 z-10 size-3.5 text-[10px] font-black leading-none text-[var(--bc-cell-ink)]"
        >
          ✓
        </span>
      </>
    ) : null;

  if (interactive) {
    return (
      <button
        ref={buttonRef}
        type="button"
        tabIndex={tabIndex}
        aria-pressed={marked}
        aria-label={
          placeholder
            ? "Empty square"
            : isFree
              ? "Free square, marked"
              : marked
                ? `${label}, marked`
                : label
        }
        onClick={isFree || placeholder ? undefined : onClick}
        onKeyDown={onKeyDown}
        disabled={placeholder}
        className={`${base} ${font} w-full ${win}`}
      >
        {dauber}
        {body}
      </button>
    );
  }

  return (
    <div
      aria-label={
        placeholder ? "Empty square" : isFree ? "Free square, marked" : label
      }
      className={`${base} ${font} ${win}`}
    >
      {dauber}
      {body}
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
  theme = "classic",
  interactive = false,
  marks,
  onToggle,
  highlightCells,
  compact = false,
  preview = false,
  example = false,
  className = "",
  deal = false,
}: {
  card: Card;
  size: GridSize;
  mode: BingoMode;
  title: string;
  subtitle?: string;
  seed: string;
  theme?: ThemeId;
  interactive?: boolean;
  marks?: boolean[];
  onToggle?: (index: number) => void;
  highlightCells?: readonly number[];
  compact?: boolean;
  /** Provisional preview — no set code shown as real. */
  preview?: boolean;
  /** Empty-state example ribbon. */
  example?: boolean;
  className?: string;
  deal?: boolean;
}) {
  const labelId = useId();
  const longest = longestItemLength(card.cells);
  const font = cellFontClass(longest, size);
  const highlight = new Set(highlightCells ?? []);
  const [focusIdx, setFocusIdx] = useState(0);
  const cellRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const freeIcon = FREE_ICON_FOR[theme];
  const isNumber = mode === "bingo75" || mode === "numbers";
  const showBingoRow = size === 5;

  const moveFocus = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(size * size - 1, next));
      setFocusIdx(clamped);
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
  const gridStyle = { "--n": size } as CSSProperties;

  return (
    <article
      lang="en"
      data-theme={theme}
      data-size={size}
      className={`bingo-card relative mx-auto w-full max-w-[min(100%,28rem)] min-w-0 rounded-[1.75rem] bg-[var(--bc-frame)] p-2.5 shadow-[0_12px_28px_-12px_rgb(15_23_42/0.45)] sm:p-3 dark:shadow-[0_14px_36px_-12px_rgb(0_0_0/0.7)] ${
        deal ? "bc-deal" : ""
      } ${className}`}
    >
      <header className="bc-band relative rounded-t-[1.25rem] bg-[var(--bc-band)] px-4 pb-2 pt-3 text-center text-[var(--bc-band-ink)]">
        {example ? (
          <span className="absolute left-2 top-2 rounded bg-black/25 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
            Example
          </span>
        ) : null}
        <p
          id={labelId}
          className="bc-title line-clamp-2 text-[clamp(1.25rem,5vw,1.75rem)] font-extrabold leading-none tracking-tight [text-wrap:balance]"
        >
          {title || "Bingo"}
        </p>
        {subtitle ? (
          <p className="bc-sub mt-1 truncate text-xs font-medium opacity-90 sm:text-sm">
            {subtitle}
          </p>
        ) : null}
      </header>

      <div
        role="grid"
        aria-labelledby={labelId}
        className="bc-grid grid gap-[3px] overflow-hidden rounded-b-[1.25rem] bg-[var(--bc-line)] p-[3px]"
        style={{
          ...gridStyle,
          gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
        }}
      >
        {showBingoRow
          ? BINGO_LETTERS.map((letter, i) => (
              <span
                key={letter}
                role="columnheader"
                className={`bc-letter col-span-1 grid aspect-[1/0.8] place-items-center rounded-lg font-black text-white shadow-[inset_0_-3px_0_rgb(0_0_0/0.18)] text-[clamp(1.25rem,6vw,2rem)] ${
                  theme === "pastel" ? "text-[#500724]" : ""
                }`}
                style={{ background: `var(--bc-letter-${i + 1})` }}
              >
                {letter}
              </span>
            ))
          : null}

        {rows.map((r) =>
          Array.from({ length: size }, (_, c) => {
            const index = r * size + c;
            const cell = card.cells[index] ?? "";
            const isFree = cell === null;
            const isPlaceholder = cell === "";
            const marked = isFree || Boolean(marks?.[index]);
            return (
              <div key={index} role="gridcell" className="min-h-0 min-w-0">
                <CellInner
                  cell={isPlaceholder ? "_" : cell}
                  marked={marked}
                  highlight={highlight.has(index)}
                  font={font}
                  isNumber={isNumber && !isFree && !isPlaceholder}
                  freeIcon={freeIcon}
                  interactive={interactive}
                  tabIndex={interactive && focusIdx === index ? 0 : -1}
                  buttonRef={(el) => {
                    cellRefs.current[index] = el;
                  }}
                  onClick={() => onToggle?.(index)}
                  onKeyDown={(e) => onKeyDown(e, index)}
                  placeholder={isPlaceholder}
                />
              </div>
            );
          }),
        )}
      </div>

      <footer className="bc-foot pt-1.5 text-center font-mono text-[10px] text-[var(--bc-band-ink)]/85">
        {preview ? (
          <>Preview</>
        ) : (
          <>
            Card {card.number}
            {" · "}
            <span aria-label={`Set code ${seedSpoken}`}>Set {seed}</span>
            {!compact ? (
              <span className="hidden min-[400px]:inline whitespace-nowrap">
                {" · "}
                exestools.com/bingo-card-generator
              </span>
            ) : null}
          </>
        )}
      </footer>
    </article>
  );
}
