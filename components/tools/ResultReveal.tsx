"use client";

type Props = {
  open: boolean;
  label?: string;
  value: string | null;
  showRemove?: boolean;
  onSpinAgain: () => void;
  onRemove?: () => void;
  onShare?: () => void;
  onClose?: () => void;
};

/** Inline celebrate banner (no page blackout). */
export function ResultReveal({
  open,
  label = "Winner",
  value,
  showRemove = true,
  onSpinAgain,
  onRemove,
  onShare,
  onClose,
}: Props) {
  if (!open || !value) return null;

  return (
    <div
      className="et-result-banner mt-4 overflow-hidden rounded-2xl border border-border px-4 py-4 sm:px-5"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--t-win, #0e7490) 85%, #0f172a), color-mix(in srgb, var(--t-accent, #0891b2) 55%, #312e81))",
      }}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-200">{label}</p>
          <p className="mt-1 break-words text-3xl font-extrabold text-white sm:text-4xl">{value}</p>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-white/80 outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Dismiss"
          >
            ✕
          </button>
        ) : null}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onSpinAgain}
          className="inline-flex min-h-11 items-center rounded-xl bg-accent-strong px-4 text-sm font-bold text-slate-950 outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-white"
        >
          Spin again
        </button>
        {showRemove && onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex min-h-11 items-center rounded-xl border border-white/35 px-4 text-sm font-bold text-white outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white"
          >
            Remove winner
          </button>
        ) : null}
        {onShare ? (
          <button
            type="button"
            onClick={onShare}
            className="inline-flex min-h-11 items-center rounded-xl border border-white/35 px-4 text-sm font-bold text-white outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white"
          >
            Share
          </button>
        ) : null}
      </div>
    </div>
  );
}
