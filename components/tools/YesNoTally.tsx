"use client";

type Entry = { label: string; count: number };

/** Coloured counters + bars for Yes / No / Maybe. */
export function YesNoTally({
  choices,
  tally,
  onReset,
}: {
  choices: string[];
  tally: Record<string, Entry>;
  onReset: () => void;
}) {
  const keys = ["Yes", "No", "Maybe"] as const;
  const onWheel = new Set(choices.map((c) => c.toLocaleLowerCase()));
  const rows = keys
    .filter((k) => onWheel.has(k.toLocaleLowerCase()))
    .map((label) => {
      const key = label.toLocaleLowerCase();
      return { label, count: tally[key]?.count ?? 0 };
    });

  const extras = Object.entries(tally)
    .filter(([k]) => !["yes", "no", "maybe"].includes(k))
    .slice(0, 3)
    .map(([, e]) => e);

  const all = [...rows, ...extras];
  const max = Math.max(1, ...all.map((r) => r.count));
  const colors = ["#15803d", "#b91c1c", "#ca8a04", "#0891b2", "#7c3aed"];

  if (!all.length) {
    return (
      <p className="mt-3 text-center text-sm text-muted" aria-live="polite">
        Counts appear after each spin
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-3" aria-live="polite">
      <div className="grid gap-2 sm:grid-cols-3">
        {all.map((row, i) => (
          <div
            key={row.label}
            className="rounded-xl border border-border bg-surface-2 px-3 py-2"
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-muted">
                {row.label}
              </span>
              <span className="text-2xl font-extrabold tabular-nums text-foreground">
                {row.count}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full transition-[width] duration-300"
                style={{
                  width: `${(row.count / max) * 100}%`,
                  background: colors[i % colors.length],
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-accent underline outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Reset counts
        </button>
      </div>
    </div>
  );
}
