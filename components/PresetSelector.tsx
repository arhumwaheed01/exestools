"use client";

import Link from "next/link";
import type { WheelPreset } from "@/lib/presets";

type Props = {
  presets: WheelPreset[];
  disabled?: boolean;
  onSelect: (preset: WheelPreset) => void;
  /** Homepage: soft-link owner tools instead of loading competing presets only */
  homeLinks?: { href: string; label: string }[];
};

export function PresetSelector({ presets, disabled, onSelect, homeLinks }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <h2 className="text-base font-bold text-foreground">Example wheels</h2>
      <p className="mt-0.5 text-xs text-muted">Load a starter list, then customize freely.</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {presets.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(p)}
            className="min-h-11 rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-left transition hover:border-accent hover:bg-background disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span className="block text-sm font-semibold text-foreground">{p.name}</span>
            <span className="mt-0.5 block text-xs text-muted">{p.description}</span>
          </button>
        ))}
      </div>
      {homeLinks && homeLinks.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
          <span className="w-full text-xs text-muted">Specialized tools:</span>
          {homeLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="inline-flex min-h-11 items-center rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-semibold text-accent hover:border-accent"
            >
              {l.label} →
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
