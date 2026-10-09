"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from "react";
import { CardGrid } from "@/components/bingo/CardGrid";
import { formatCall, type CallerState } from "@/lib/bingo/caller";
import {
  BINGO_LETTERS,
  letterFor,
  type BingoMode,
  type Card,
} from "@/lib/bingo/cards";
import type { GridSize } from "@/lib/bingo/list";
import { BALL_COLORS, type ThemeId } from "@/lib/bingo/themes";
import { PATTERN_LABELS, type Pattern } from "@/lib/bingo/win";

function ballColorForCall(call: string, mode: BingoMode): string {
  if (mode !== "bingo75") return "var(--bc-band)";
  const n = Number(call);
  if (!Number.isFinite(n)) return BALL_COLORS[2];
  const col = Math.min(4, Math.max(0, Math.floor((n - 1) / 15)));
  return BALL_COLORS[col]!;
}

function CallBall({
  call,
  mode,
  theme,
}: {
  call: string | null;
  mode: BingoMode;
  theme: ThemeId;
}) {
  const ball = call ? ballColorForCall(call, mode) : "var(--bc-band)";
  if (!call) {
    return (
      <div className="mx-auto flex min-h-24 items-center justify-center rounded-3xl border border-dashed border-border px-6 text-sm text-muted">
        Press Call next to start.
      </div>
    );
  }

  if (mode === "bingo75") {
    const letter = letterFor(Number(call));
    return (
      <div
        key={call}
        className="bc-pop relative mx-auto grid size-36 place-items-center rounded-full sm:size-40"
        style={{
          background: `radial-gradient(circle at 22% 18%, rgb(255 255 255 / 0.35) 0 12%, ${ball} 13% 100%)`,
        }}
      >
        <div className="grid size-[62%] place-items-center rounded-full bg-white text-slate-900 shadow-inner">
          <span className="text-sm font-black leading-none">{letter}</span>
          <span className="text-5xl font-black tabular-nums leading-none">{call}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      key={call}
      data-theme={theme}
      className="bc-pop bingo-card mx-auto flex min-h-24 max-w-full items-center justify-center rounded-3xl bg-[var(--bc-band)] px-6 text-center text-[clamp(1.5rem,7vw,2.5rem)] font-extrabold text-[var(--bc-band-ink)]"
    >
      {call}
    </div>
  );
}

export function BingoHostPanels({
  mode,
  title,
  subtitle,
  seed,
  cards,
  gridSize,
  theme,
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
  theme: ThemeId;
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
  const panelRef = useRef<HTMLElement>(null);
  const [boardOpen, setBoardOpen] = useState(true);

  useEffect(() => {
    // Desktop: board open by default; collapse on narrow via CSS disclosure default
    const mq = window.matchMedia("(min-width: 640px)");
    setBoardOpen(mq.matches);
    const fn = () => setBoardOpen(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  const recent = [...caller.called].slice(-6, -1).reverse(); // previous 5 (exclude current)

  const onPanelKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key !== " " && e.key !== "Enter") return;
    const t = e.target as HTMLElement;
    const tag = t.tagName;
    if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
    if (tag === "BUTTON" && t !== callNextRef.current) return;
    if (t.isContentEditable) return;
    e.preventDefault();
    onCallNext();
  };

  return (
    <div className="min-w-0 space-y-4 rounded-3xl border border-border bg-surface p-3 sm:p-5 lg:sticky lg:top-4 lg:self-start print:hidden">
      <section
        ref={panelRef}
        aria-labelledby="bg-caller"
        className="bingo-card min-w-0 outline-none"
        data-theme={theme}
        tabIndex={-1}
        onKeyDown={onPanelKeyDown}
      >
        <h2 id="bg-caller" className="text-lg font-bold text-foreground">
          Caller
        </h2>

        <div className="mt-4">
          <CallBall call={currentCall} mode={mode} theme={theme} />
        </div>

        <p className="mt-2 text-center text-sm text-muted">
          Called {caller.called.length} of {caller.pool.length || "—"}
        </p>

        <h3 className="sr-only">Last 5</h3>
        {recent.length > 0 ? (
          <ul className="mt-3 flex flex-wrap items-center justify-center gap-2">
            {recent.map((c, i) => {
              const opacity = [0.85, 0.7, 0.55, 0.4, 0.4][i] ?? 0.4;
              const color = ballColorForCall(c, mode);
              if (mode === "bingo75") {
                return (
                  <li
                    key={`${c}-${i}`}
                    className="grid size-11 place-items-center rounded-full text-xs font-bold text-white"
                    style={{ background: color, opacity }}
                  >
                    {letterFor(Number(c))}
                    {c}
                  </li>
                );
              }
              return (
                <li
                  key={`${c}-${i}`}
                  className="inline-flex min-h-9 items-center rounded-full px-3 text-sm font-semibold text-[var(--bc-band-ink)]"
                  style={{ background: "var(--bc-band)", opacity }}
                >
                  {c}
                </li>
              );
            })}
          </ul>
        ) : null}

        <div aria-live="assertive" aria-atomic="true" className="sr-only">
          {callerAnnounce}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            ref={callNextRef}
            type="button"
            disabled={!cards.length || finished || caller.pool.length === 0}
            onClick={onCallNext}
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl bg-accent-strong px-4 text-sm font-bold text-slate-950 outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
          >
            Call next
          </button>
          <button
            type="button"
            disabled={!caller.called.length}
            onClick={onUndoCall}
            className="inline-flex min-h-11 items-center rounded-xl border border-border px-3 text-xs font-bold outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40"
          >
            Undo
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
        <p className="mt-2 hidden text-xs text-muted pointer-fine:block">
          <kbd className="rounded border border-border px-1 font-mono text-[10px]">Space</kbd>{" "}
          calls next when the caller is focused
        </p>

        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!caller.called.length}
            onClick={onCopyCalled}
            className="inline-flex min-h-11 items-center rounded-xl border border-border px-3 text-xs font-bold outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40"
          >
            Copy called list
          </button>
        </div>

        {finished && caller.pool.length > 0 ? (
          <p className="mt-2 text-sm text-muted">
            Everything has been called. Start a new game to play again.
          </p>
        ) : null}

        {caller.called.length > 0 ? (
          <ol
            reversed
            className="mt-3 max-h-32 list-decimal space-y-1 overflow-x-visible overflow-y-auto text-sm"
            style={{ paddingLeft: "calc(1.25rem + 2.5ch)" }}
          >
            {[...caller.called].reverse().map((c, i) => (
              <li key={`${c}-${i}`}>{formatCall(c, mode)}</li>
            ))}
          </ol>
        ) : null}

        {mode === "bingo75" ? (
          <div className="mt-3">
            <button
              type="button"
              className="mb-2 text-xs font-bold text-muted underline outline-none focus-visible:ring-2 focus-visible:ring-accent sm:hidden"
              onClick={() => setBoardOpen((v) => !v)}
            >
              {boardOpen ? "Hide board" : "Show board"}
            </button>
            {boardOpen ? (
              <div
                aria-hidden
                className="grid gap-1 text-[10px] sm:text-xs"
                style={{ gridTemplateColumns: "auto repeat(15, minmax(0, 1fr))" }}
              >
                {BINGO_LETTERS.map((letter, col) => {
                  const [lo, hi] = [col * 15 + 1, col * 15 + 15] as const;
                  const color = BALL_COLORS[col]!;
                  return (
                    <div key={letter} className="contents">
                      <div
                        className="flex items-center justify-center rounded px-1 font-black text-white"
                        style={{ background: color }}
                      >
                        {letter}
                      </div>
                      {Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).map((n) => {
                        const called = caller.called.includes(String(n));
                        const latest = currentCall === String(n);
                        return (
                          <div
                            key={n}
                            className={`grid aspect-square place-items-center rounded-full tabular-nums ${
                              called
                                ? "font-bold text-white"
                                : "border border-border bg-surface text-muted"
                            } ${latest ? "ring-2 ring-offset-2 ring-offset-surface" : ""}`}
                            style={
                              called
                                ? {
                                    background: color,
                                    ...(latest ? { ["--tw-ring-color" as string]: color } : {}),
                                  }
                                : undefined
                            }
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
          </div>
        ) : caller.pool.length > 0 ? (
          <div aria-hidden className="mt-3 flex max-h-40 flex-wrap gap-1.5 overflow-y-auto">
            {caller.pool.map((item) => {
              const called = caller.called.includes(item);
              return (
                <span
                  key={item}
                  className={`inline-flex min-h-8 items-center rounded-full px-2 text-[11px] font-semibold ${
                    called
                      ? "bg-[var(--bc-band)] text-[var(--bc-band-ink)]"
                      : "border border-border text-muted"
                  }`}
                >
                  {called ? "✓ " : ""}
                  {item}
                </span>
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
              theme={theme}
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
