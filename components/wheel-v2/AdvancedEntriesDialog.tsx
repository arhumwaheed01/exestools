"use client";

import { useEffect, useId, useState } from "react";
import { ChevronDown, ChevronUp, Trash2, X } from "lucide-react";
import { choicesToText } from "@/lib/wheel";

type Row = {
  name: string;
  color: string;
  weight: number;
  enabled: boolean;
};

type Props = {
  open: boolean;
  entries: string[];
  swatches: string[];
  onCancel: () => void;
  onOk: (entries: string[]) => void;
};

export function AdvancedEntriesDialog({ open, entries, swatches, onCancel, onOk }: Props) {
  const titleId = useId();
  const [warned, setWarned] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (!open) {
      setWarned(false);
      return;
    }
    setRows(
      entries.map((name, i) => ({
        name,
        color: swatches[i % swatches.length] ?? "#888888",
        weight: 1,
        enabled: true,
      })),
    );
  }, [open, entries, swatches]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  const totalWeight = rows.filter((r) => r.enabled).reduce((s, r) => s + Math.max(0.01, r.weight), 0);

  if (!warned) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
        <div
          className="w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <h2 id={titleId} className="text-lg font-extrabold text-foreground">
            Advanced mode
          </h2>
          <p className="mt-2 text-sm text-muted">
            Advanced mode lets you edit each entry&apos;s color, weight, and order. Weighted odds
            change how often each option can win. Continue?
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="min-h-11 rounded-xl border border-border px-4 text-sm font-bold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setWarned(true)}
              className="min-h-11 rounded-xl bg-accent-strong px-4 text-sm font-bold text-slate-950"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4">
      <div
        className="flex max-h-[min(92dvh,40rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 id={titleId} className="text-base font-extrabold">
            Advanced entries
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-surface-2"
            aria-label="Cancel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
          {rows.map((row, i) => {
            const pct =
              row.enabled && totalWeight > 0
                ? Math.round((Math.max(0.01, row.weight) / totalWeight) * 1000) / 10
                : 0;
            return (
              <div
                key={i}
                className="grid grid-cols-[auto_auto_1fr_auto_auto_auto_auto] items-center gap-1.5 rounded-xl border border-border bg-surface-2 p-2"
              >
                <button
                  type="button"
                  disabled={i === 0}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg disabled:opacity-30"
                  onClick={() =>
                    setRows((r) => {
                      const next = [...r];
                      const tmp = next[i - 1]!;
                      next[i - 1] = next[i]!;
                      next[i] = tmp;
                      return next;
                    })
                  }
                  aria-label="Move up"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={i === rows.length - 1}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg disabled:opacity-30"
                  onClick={() =>
                    setRows((r) => {
                      const next = [...r];
                      const tmp = next[i + 1]!;
                      next[i + 1] = next[i]!;
                      next[i] = tmp;
                      return next;
                    })
                  }
                  aria-label="Move down"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                <input
                  type="text"
                  value={row.name}
                  onChange={(e) =>
                    setRows((r) =>
                      r.map((x, j) => (j === i ? { ...x, name: e.target.value.slice(0, 64) } : x)),
                    )
                  }
                  className="min-h-9 rounded-lg border border-border bg-surface px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />
                <input
                  type="color"
                  value={/^#[0-9a-fA-F]{6}$/.test(row.color) ? row.color : "#888888"}
                  onChange={(e) =>
                    setRows((r) => r.map((x, j) => (j === i ? { ...x, color: e.target.value } : x)))
                  }
                  className="h-9 w-9 cursor-pointer rounded border border-border"
                  aria-label="Color"
                />
                <label className="flex items-center gap-1 text-[10px] text-muted">
                  <input
                    type="number"
                    min={0.1}
                    step={0.1}
                    value={row.weight}
                    onChange={(e) =>
                      setRows((r) =>
                        r.map((x, j) =>
                          j === i ? { ...x, weight: Math.max(0.1, Number(e.target.value) || 0.1) } : x,
                        ),
                      )
                    }
                    className="w-14 rounded border border-border bg-surface px-1 py-1 text-xs text-foreground"
                  />
                  {pct}%
                </label>
                <input
                  type="checkbox"
                  checked={row.enabled}
                  onChange={(e) =>
                    setRows((r) =>
                      r.map((x, j) => (j === i ? { ...x, enabled: e.target.checked } : x)),
                    )
                  }
                  aria-label="Enabled"
                />
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-rose-300 hover:bg-rose-950/40"
                  onClick={() => setRows((r) => r.filter((_, j) => j !== i))}
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
          <button
            type="button"
            className="min-h-10 w-full rounded-xl border border-dashed border-border text-sm font-bold text-muted hover:bg-surface-2"
            onClick={() =>
              setRows((r) => [
                ...r,
                {
                  name: `Entry ${r.length + 1}`,
                  color: swatches[r.length % swatches.length] ?? "#888888",
                  weight: 1,
                  enabled: true,
                },
              ])
            }
          >
            Add entry
          </button>
        </div>
        <div className="flex justify-end gap-2 border-t border-border px-4 py-3">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-11 rounded-xl border border-border px-4 text-sm font-bold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              const enabled = rows.filter((r) => r.enabled && r.name.trim());
              // Expand by weight into repeated lines so odds match without backend weighting.
              const expanded: string[] = [];
              const minW = Math.min(...enabled.map((r) => r.weight));
              for (const r of enabled) {
                const copies = Math.max(1, Math.round(r.weight / minW));
                for (let c = 0; c < copies; c++) {
                  expanded.push(c === 0 ? r.name.trim() : `${r.name.trim()} (${c + 1})`);
                }
              }
              onOk(expanded.length >= 2 ? expanded : enabled.map((r) => r.name.trim()));
            }}
            className="min-h-11 rounded-xl bg-accent-strong px-4 text-sm font-bold text-slate-950"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

/** Helper kept for call sites that rebuild textarea text. */
export function entriesToText(entries: string[]) {
  return choicesToText(entries);
}
