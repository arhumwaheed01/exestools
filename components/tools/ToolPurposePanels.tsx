"use client";

import Link from "next/link";
import { GALLERY_WHEELS } from "@/lib/wheel-v2/gallery";

const PRIZE_RULES = `Prize wheel rules
• One spin per person
• Land on a slice to claim that prize
• While supplies last
• Staff decision is final`;

/** Classroom: roster with absent toggles + round progress — visible on load. */
export function ClassroomRosterPanel({
  names,
  absent,
  pickedCount,
  total,
  onToggleAbsent,
  disabled,
}: {
  names: string[];
  absent: Set<string>;
  pickedCount: number;
  total: number;
  onToggleAbsent: (name: string) => void;
  disabled?: boolean;
}) {
  const present = names.filter((n) => !absent.has(n.toLocaleLowerCase()));
  const remaining = present.length;

  return (
    <div className="w-full rounded-2xl border border-border bg-surface p-3 sm:p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-extrabold tracking-tight text-foreground">Class roster</h2>
        <p className="text-xs font-bold tabular-nums text-muted" aria-live="polite">
          Round progress: {pickedCount} of {total || names.length}
          {absent.size > 0 ? ` · ${remaining} present` : null}
        </p>
      </div>
      <p className="mt-1 text-xs text-muted">
        Mark absent students so they stay off the wheel. Present names spin as usual.
      </p>
      <ul className="mt-3 grid max-h-40 grid-cols-2 gap-1.5 overflow-y-auto sm:grid-cols-3 md:grid-cols-4">
        {names.map((name) => {
          const key = name.toLocaleLowerCase();
          const isAbsent = absent.has(key);
          return (
            <li key={key}>
              <label
                className={`flex min-h-9 cursor-pointer items-center gap-2 rounded-lg border px-2 text-xs font-semibold ${
                  isAbsent
                    ? "border-border/60 bg-surface-2/50 text-muted line-through"
                    : "border-border bg-surface-2 text-foreground"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isAbsent}
                  disabled={disabled}
                  onChange={() => onToggleAbsent(name)}
                  className="h-3.5 w-3.5 accent-cyan-500"
                  aria-label={`${name} absent`}
                />
                <span className="truncate">{name}</span>
                <span className="ml-auto shrink-0 text-[10px] font-bold uppercase tracking-wide text-muted">
                  {isAbsent ? "Out" : "In"}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Prize wheel: odds table + rules-to-post box — visible on load. */
export function PrizeOddsPanel({
  prizes,
  weights,
}: {
  prizes: string[];
  weights: Record<string, number>;
}) {
  const rows = prizes.map((label) => {
    const w = weights[label.toLocaleLowerCase()] ?? 1;
    return { label, weight: w };
  });
  const total = rows.reduce((s, r) => s + r.weight, 0) || 1;

  return (
    <div className="grid w-full gap-3 sm:grid-cols-2">
      <div className="rounded-2xl border border-border bg-surface p-3 sm:p-4">
        <h2 className="text-sm font-extrabold tracking-tight text-foreground">Prizes and odds</h2>
        <p className="mt-1 text-xs text-muted">Shown for the prizes currently on the wheel.</p>
        <div className="mt-3 max-h-44 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-[10px] uppercase tracking-wide text-muted">
                <th className="py-1.5 pr-2 font-bold">Prize</th>
                <th className="py-1.5 font-bold">Odds</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const pct = ((r.weight / total) * 100).toFixed(1);
                return (
                  <tr key={r.label} className="border-b border-border/60">
                    <td className="py-1.5 pr-2 font-semibold text-foreground">{r.label}</td>
                    <td className="py-1.5 tabular-nums text-muted">
                      {r.weight} in {total} ({pct}%)
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-surface p-3 sm:p-4">
        <h2 className="text-sm font-extrabold tracking-tight text-foreground">Rules to post</h2>
        <p className="mt-1 text-xs text-muted">Copy onto a booth sign or slide.</p>
        <pre className="mt-3 max-h-44 overflow-y-auto whitespace-pre-wrap rounded-xl border border-border bg-surface-2 p-3 text-xs leading-relaxed text-foreground">
          {PRIZE_RULES}
        </pre>
        <button
          type="button"
          className="mt-2 inline-flex min-h-9 items-center rounded-lg border border-border bg-surface-2 px-3 text-xs font-bold text-foreground hover:bg-border"
          onClick={() => void navigator.clipboard.writeText(PRIZE_RULES)}
        >
          Copy rules
        </button>
      </div>
    </div>
  );
}

/** Yes/No: coin mode + tally callout — front and centre on load. */
export function YesNoModeBar({
  onCoinMode,
  onYesNo,
  isCoin,
}: {
  onCoinMode: () => void;
  onYesNo: () => void;
  isCoin: boolean;
}) {
  return (
    <div className="flex w-full flex-col gap-2 rounded-2xl border border-accent/40 bg-surface p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
      <div>
        <h2 className="text-sm font-extrabold tracking-tight text-foreground">Decision mode</h2>
        <p className="mt-0.5 text-xs text-muted">
          Tally counts every spin below. Switch to coin flip anytime.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onYesNo}
          className={`inline-flex min-h-10 items-center rounded-xl px-3 text-xs font-bold outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            !isCoin
              ? "bg-accent-strong text-slate-950"
              : "border border-border bg-surface-2 text-foreground hover:bg-border"
          }`}
        >
          Yes / No
        </button>
        <button
          type="button"
          onClick={onCoinMode}
          className={`inline-flex min-h-10 items-center rounded-xl px-3 text-xs font-bold outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            isCoin
              ? "bg-accent-strong text-slate-950"
              : "border border-border bg-surface-2 text-foreground hover:bg-border"
          }`}
        >
          Coin flip (Heads / Tails)
        </button>
      </div>
    </div>
  );
}

/** Homepage: gallery strip linking into /wheel-gallery — visible on load. */
export function HomeGalleryStrip() {
  const strip = GALLERY_WHEELS.slice(0, 8);
  return (
    <div className="w-full rounded-2xl border border-border bg-surface p-3 sm:p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-extrabold tracking-tight text-foreground">Preset gallery</h2>
        <Link
          href="/wheel-gallery"
          className="text-xs font-bold text-accent hover:underline outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Browse all wheels →
        </Link>
      </div>
      <p className="mt-1 text-xs text-muted">Open a ready-made wheel, then edit and spin.</p>
      <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {strip.map((w) => (
          <li key={w.id} className="shrink-0">
            <Link
              href={`/wheel-gallery?q=${encodeURIComponent(w.title)}`}
              className="flex w-40 flex-col rounded-xl border border-border bg-surface-2 p-3 outline-none hover:border-accent/50 focus-visible:ring-2 focus-visible:ring-accent"
            >
              <span className="text-xs font-bold text-foreground">{w.title}</span>
              <span className="mt-1 line-clamp-2 text-[11px] leading-snug text-muted">{w.blurb}</span>
              <span className="mt-2 text-[10px] font-semibold text-muted">
                {w.choices.length} slices
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
