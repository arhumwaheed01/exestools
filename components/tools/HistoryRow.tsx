"use client";

export function HistoryRow({
  items,
  max = 5,
  onClear,
  label = "Last 5 results",
}: {
  items: string[];
  max?: number;
  onClear?: () => void;
  label?: string;
}) {
  const shown = items.slice(0, max);
  if (!shown.length) return null;

  return (
    <div className="mt-3" aria-label={label}>
      {label !== "Last 5 results" ? (
        <p className="mb-1.5 text-center text-xs font-bold uppercase tracking-wide text-muted">
          {label}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {shown.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="inline-flex min-h-11 items-center rounded-full border border-border bg-surface-2 px-3 text-xs font-semibold text-foreground"
          >
            {item}
          </span>
        ))}
        {onClear ? (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex min-h-11 items-center text-sm font-semibold text-muted underline outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}
