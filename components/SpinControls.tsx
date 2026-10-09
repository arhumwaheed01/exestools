"use client";

import type { Ref } from "react";
import { Volume2, VolumeX, RotateCcw } from "lucide-react";
import type { SpinLength } from "@/lib/tools/sound";

type Props = {
  canSpin: boolean;
  spinning: boolean;
  soundEnabled: boolean;
  status: string;
  spinLength: SpinLength;
  onSpin: () => void;
  onReset: () => void;
  onToggleSound: () => void;
  onSpinLength: (v: SpinLength) => void;
  /** When true, omit the SPIN button (parent renders StickySpinButton). */
  hideSpinButton?: boolean;
  spinButtonRef?: Ref<HTMLButtonElement>;
};

type StickyPlacement = "fixed-mobile" | "inline-desktop" | "both";

/** SPIN CTA — fixed on phones (viewport), inline under the wheel from sm up. */
export function StickySpinButton({
  canSpin,
  spinning,
  onSpin,
  buttonRef,
  placement = "both",
}: {
  canSpin: boolean;
  spinning: boolean;
  onSpin: () => void;
  buttonRef?: Ref<HTMLButtonElement>;
  placement?: StickyPlacement;
}) {
  const showFixed = placement === "fixed-mobile" || placement === "both";
  const showInline = placement === "inline-desktop" || placement === "both";

  return (
    <>
      {showFixed ? (
        <>
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-3 pt-2 backdrop-blur pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:hidden print:hidden">
            <button
              ref={buttonRef}
              type="button"
              onClick={onSpin}
              disabled={!canSpin || spinning}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-accent-strong px-8 text-lg font-extrabold tracking-wide text-slate-950 transition hover:bg-accent focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55"
              aria-busy={spinning}
            >
              {spinning ? "Spinning…" : "SPIN (Space)"}
            </button>
          </div>
          <div className="h-16 sm:hidden print:hidden" aria-hidden />
        </>
      ) : null}

      {showInline ? (
        <div className="mt-3 hidden w-full sm:block">
          <button
            type="button"
            onClick={onSpin}
            disabled={!canSpin || spinning}
            className="inline-flex min-h-12 w-full max-w-xs mx-auto items-center justify-center rounded-2xl bg-accent-strong px-8 text-lg font-extrabold tracking-wide text-slate-950 transition hover:bg-accent focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55"
            aria-busy={spinning}
          >
            {spinning ? "Spinning…" : "SPIN (Space)"}
          </button>
        </div>
      ) : null}
    </>
  );
}

export function SpinControls({
  canSpin,
  spinning,
  soundEnabled,
  status,
  spinLength,
  onSpin,
  onReset,
  onToggleSound,
  onSpinLength,
  hideSpinButton = false,
  spinButtonRef,
}: Props) {
  return (
    <div className="mt-5 flex flex-col items-center gap-3">
      {!hideSpinButton ? (
        <StickySpinButton
          canSpin={canSpin}
          spinning={spinning}
          onSpin={onSpin}
          buttonRef={spinButtonRef}
        />
      ) : null}

      <div
        role="radiogroup"
        aria-label="Spin length"
        className="flex flex-wrap items-center justify-center gap-2"
      >
        {(
          [
            ["short", "Short"],
            ["normal", "Normal"],
            ["long", "Long"],
          ] as const
        ).map(([id, label]) => (
          <label
            key={id}
            className={`inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full border px-4 text-sm font-bold outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent ${
              spinLength === id
                ? "border-accent bg-accent/10 text-foreground"
                : "border-border text-muted hover:bg-surface-2"
            }`}
          >
            <input
              type="radio"
              name="spin-length"
              className="sr-only"
              checked={spinLength === id}
              onChange={() => onSpinLength(id)}
            />
            {label}
          </label>
        ))}
      </div>

      <p className="hidden text-center text-xs text-muted pointer-fine:block">
        Tip: press <kbd className="rounded border border-border px-1 font-mono">Space</kbd> to
        spin when the wheel is focused.
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onReset}
          disabled={spinning}
          className="inline-flex min-h-11 min-w-11 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold text-foreground hover:bg-surface-2 disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          Reset rotation
        </button>
        <button
          type="button"
          onClick={onToggleSound}
          className="inline-flex min-h-11 min-w-11 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold text-foreground hover:bg-surface-2 outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-pressed={soundEnabled}
          title={soundEnabled ? "Mute spin sound" : "Enable spin sound"}
        >
          {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          Sound {soundEnabled ? "on" : "off"}
        </button>
      </div>
      <p className="text-center text-sm text-muted" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
