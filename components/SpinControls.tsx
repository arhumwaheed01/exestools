"use client";

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
};

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
}: Props) {
  return (
    <div className="mt-5 flex flex-col items-center gap-3">
      <div className="sticky bottom-0 z-30 w-full max-w-xs border-t border-border bg-surface/95 px-1 py-2 backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none lg:static">
        <button
          type="button"
          onClick={onSpin}
          disabled={!canSpin || spinning}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-accent-strong px-8 text-lg font-extrabold tracking-wide text-slate-950 transition hover:bg-accent focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55"
          aria-busy={spinning}
        >
          {spinning ? "Spinning…" : "SPIN (Space)"}
        </button>
      </div>

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
            className={`inline-flex min-h-9 cursor-pointer items-center rounded-full border px-3 text-xs font-bold outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent ${
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
          className="inline-flex min-h-11 min-w-11 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-foreground hover:bg-surface-2 disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          Reset rotation
        </button>
        <button
          type="button"
          onClick={onToggleSound}
          className="inline-flex min-h-11 min-w-11 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-foreground hover:bg-surface-2 outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
