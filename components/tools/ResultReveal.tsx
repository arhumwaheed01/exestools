"use client";

type Variant = "default" | "yesno" | "prize" | "number";

type Props = {
  open: boolean;
  label?: string;
  value: string | null;
  showRemove?: boolean;
  variant?: Variant;
  spinAgainLabel?: string;
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
  variant = "default",
  spinAgainLabel = "Spin again",
  onSpinAgain,
  onRemove,
  onShare,
  onClose,
}: Props) {
  if (!open || !value) return null;

  const isYesNo = variant === "yesno";
  const isPrize = variant === "prize";
  const isNumber = variant === "number";

  return (
    <div
      className={`et-result-banner mt-4 overflow-hidden rounded-2xl border border-border px-4 py-4 sm:px-5 ${
        isPrize ? "et-prize-card" : ""
      }`}
      style={{
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--t-win, #0e7490) 85%, #0f172a), color-mix(in srgb, var(--t-accent, #0891b2) 55%, #312e81))",
      }}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-200">{label}</p>
          {isPrize ? (
            <div className="et-prize-ribbon mt-2" aria-hidden />
          ) : null}
          {isNumber ? (
            <div className="et-number-ball mx-auto mt-3 grid size-28 place-items-center rounded-full border-4 border-white/40 bg-white/15 text-5xl font-black tabular-nums text-white shadow-inner sm:size-32 sm:text-6xl">
              {value}
            </div>
          ) : (
            <p
              className={`mt-1 break-words font-extrabold text-white ${
                isYesNo
                  ? "text-5xl uppercase tracking-wide sm:text-6xl"
                  : "text-3xl sm:text-4xl"
              }`}
            >
              {value}
            </p>
          )}
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
          {spinAgainLabel}
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
