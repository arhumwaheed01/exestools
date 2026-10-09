"use client";

import Link from "next/link";
import type { RefObject } from "react";
import { CardGrid } from "@/components/bingo/CardGrid";
import { formatCall, type CallerState } from "@/lib/bingo/caller";
import {
  BINGO_LETTERS,
  letterFor,
  type BingoMode,
  type Card,
} from "@/lib/bingo/cards";
import type { GridSize } from "@/lib/bingo/list";
import { PATTERN_LABELS, type Pattern } from "@/lib/bingo/win";

export function BingoHostPanels({
  mode,
  title,
  subtitle,
  seed,
  cards,
  gridSize,
  caller,
  currentCall,
  finished,
  callerAnnounce,
  callNextRef,
  checkResultRef,
  checkSelectId,
  checkN,
  setCheckN,
  pattern,
  setPattern,
  checkMsg,
  checkHighlight,
  checkCardData,
  checkMarks,
  onCallNext,
  onUndoCall,
  onCopyCalled,
  onNewGame,
  onCheck,
}: {
  mode: BingoMode;
  title: string;
  subtitle: string;
  seed: string | undefined;
  cards: Card[];
  gridSize: GridSize;
  caller: CallerState;
  currentCall: string | null;
  finished: boolean;
  callerAnnounce: string;
  callNextRef: RefObject<HTMLButtonElement | null>;
  checkResultRef: RefObject<HTMLParagraphElement | null>;
  checkSelectId: string;
  checkN: number;
  setCheckN: (n: number) => void;
  pattern: Pattern;
  setPattern: (p: Pattern) => void;
  checkMsg: string;
  checkHighlight: number[];
  checkCardData: Card | undefined;
  checkMarks: boolean[];
  onCallNext: () => void;
  onUndoCall: () => void;
  onCopyCalled: () => void;
  onNewGame: () => void;
  onCheck: () => void;
}) {
  return (
    <div className="min-w-0 space-y-4 rounded-3xl border border-border bg-surface p-3 sm:p-5 lg:sticky lg:top-4 lg:self-start print:hidden">
      <section aria-labelledby="bg-caller" className="min-w-0">
        <h2 id="bg-caller" className="text-lg font-bold text-foreground">
          Caller
        </h2>

        <div className="mt-3 min-h-[4.5rem] text-center">
          {currentCall ? (
            mode === "bingo75" ? (
              <div className="flex items-center justify-center gap-2">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent-strong text-xl font-bold text-slate-950">
                  {letterFor(Number(currentCall))}
                </span>
                <span className="text-5xl font-bold text-foreground">{currentCall}</span>
              </div>
            ) : (
              <p className="wrap-break-word hyphens-auto text-5xl font-bold leading-tight text-foreground">
                {currentCall}
              </p>
            )
          ) : (
            <p className="text-sm text-muted">Press Call next to start.</p>
          )}
        </div>
        <p className="mt-1 text-center text-sm text-muted">
          Called {caller.called.length} of {caller.pool.length || "—"}
        </p>

        <div aria-live="assertive" aria-atomic="true" className="sr-only">
          {callerAnnounce}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            ref={callNextRef}
            type="button"
            disabled={!cards.length || finished || caller.pool.length === 0}
            onClick={onCallNext}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-accent-strong px-4 text-sm font-bold text-slate-950 outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
          >
            Call next
          </button>
          <button
            type="button"
            disabled={!caller.called.length}
            onClick={onUndoCall}
            className="inline-flex min-h-11 items-center rounded-xl border border-border px-3 text-xs font-bold outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40"
          >
            Undo last call
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!caller.called.length}
            onClick={onCopyCalled}
            className="inline-flex min-h-11 items-center rounded-xl border border-border px-3 text-xs font-bold outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40"
          >
            Copy called list
          </button>
          <button
            type="button"
            disabled={!cards.length}
            onClick={onNewGame}
            className="inline-flex min-h-11 items-center rounded-xl border border-border px-3 text-xs font-bold outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40"
          >
            New game
          </button>
        </div>

        {finished && caller.pool.length > 0 ? (
          <p className="mt-2 text-sm text-muted">
            Everything has been called. Start a new game to play again.
          </p>
        ) : null}

        {caller.called.length > 0 ? (
          <ol reversed className="mt-3 max-h-40 list-decimal space-y-1 overflow-y-auto pl-5 text-sm">
            {[...caller.called].reverse().map((c, i) => (
              <li key={`${c}-${i}`}>{formatCall(c, mode)}</li>
            ))}
          </ol>
        ) : null}

        {mode === "bingo75" ? (
          <div
            aria-hidden
            className="mt-3 grid gap-1 text-[10px]"
            style={{ gridTemplateColumns: "auto repeat(15, minmax(0, 1fr))" }}
          >
            {BINGO_LETTERS.map((letter, col) => {
              const [lo, hi] = [col * 15 + 1, col * 15 + 15] as const;
              return (
                <div key={letter} className="contents">
                  <div className="flex items-center font-bold">{letter}</div>
                  {Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).map((n) => {
                    const called = caller.called.includes(String(n));
                    return (
                      <div
                        key={n}
                        className={`flex aspect-square items-center justify-center rounded border border-border ${
                          called ? "bg-accent-strong text-slate-950" : "bg-background"
                        }`}
                      >
                        {n}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ) : null}

        <p className="mt-3 text-xs text-muted">
          Prefer a spinning wheel on a big screen? Use the{" "}
          <Link
            href="/random-number-wheel"
            className="font-semibold text-foreground underline outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            random number wheel
          </Link>{" "}
          with 1–75.
        </p>
      </section>

      <section aria-labelledby="bg-check" className="min-w-0 border-t border-border pt-4">
        <h2 id="bg-check" className="text-lg font-bold text-foreground">
          Check a card
        </h2>

        <div className="mt-3 flex flex-wrap gap-3">
          <div>
            <label htmlFor="bg-check-n" className="text-xs text-muted">
              Card number
            </label>
            <input
              id="bg-check-n"
              type="number"
              inputMode="numeric"
              min={1}
              max={cards.length || 1}
              value={checkN}
              disabled={!cards.length}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (!Number.isFinite(n)) return;
                setCheckN(Math.min(cards.length || 1, Math.max(1, Math.round(n))));
              }}
              className="mt-1 block w-20 min-h-11 rounded-xl border border-border bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
            />
          </div>
          <div className="min-w-0 flex-1">
            <label htmlFor={checkSelectId} className="text-xs text-muted">
              Pattern
            </label>
            <select
              id={checkSelectId}
              value={pattern}
              disabled={!cards.length}
              onChange={(e) => setPattern(e.target.value as Pattern)}
              className="mt-1 w-full min-h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
            >
              {(Object.keys(PATTERN_LABELS) as Pattern[]).map((p) => (
                <option key={p} value={p}>
                  {PATTERN_LABELS[p]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          disabled={!cards.length || !caller.called.length}
          onClick={onCheck}
          className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-border px-4 text-sm font-bold outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
        >
          Check
        </button>

        {checkMsg ? (
          <p
            ref={checkResultRef}
            tabIndex={-1}
            role="status"
            className="mt-2 text-sm font-semibold text-foreground outline-none"
          >
            {checkMsg}
          </p>
        ) : null}

        {checkCardData && seed && checkMsg ? (
          <div className="mx-auto mt-3 w-full max-w-[min(100%,28rem)] min-w-0">
            <CardGrid
              card={checkCardData}
              size={gridSize}
              mode={mode}
              title={title}
              subtitle={subtitle}
              seed={seed}
              marks={checkMarks}
              highlightCells={checkHighlight}
              compact
            />
          </div>
        ) : null}
      </section>
    </div>
  );
}
