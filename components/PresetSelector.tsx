"use client";

import { WHEEL_PRESETS, type WheelPreset } from "@/lib/presets";

type Props = {
  disabled?: boolean;
  onSelect: (preset: WheelPreset) => void;
};

export function PresetSelector({ disabled, onSelect }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <h2 className="text-base font-bold text-foreground">Example wheels</h2>
      <p className="mt-0.5 text-xs text-muted">Load a starter list, then customize freely.</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {WHEEL_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(p)}
            className="rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-left transition hover:border-accent hover:bg-background disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span className="block text-sm font-semibold text-foreground">{p.name}</span>
            <span className="mt-0.5 block text-xs text-muted">{p.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
