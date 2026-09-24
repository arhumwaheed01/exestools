"use client";

import { Volume2, VolumeX, RotateCcw } from "lucide-react";

type Props = {
  canSpin: boolean;
  spinning: boolean;
  soundEnabled: boolean;
  status: string;
  onSpin: () => void;
  onReset: () => void;
  onToggleSound: () => void;
};

export function SpinControls({
  canSpin,
  spinning,
  soundEnabled,
  status,
  onSpin,
  onReset,
  onToggleSound,
}: Props) {
  return (
    <div className="mt-5 flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={onSpin}
        disabled={!canSpin || spinning}
        className="inline-flex min-h-[52px] w-full max-w-xs items-center justify-center rounded-2xl bg-accent-strong px-8 text-lg font-extrabold tracking-wide text-slate-950 transition hover:bg-accent focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55"
        aria-busy={spinning}
      >
        {spinning ? "Spinning…" : "SPIN"}
      </button>
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
          title={soundEnabled ? "Mute spin sound" : "Enable spin sound (optional)"}
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
