"use client";

import { useState } from "react";
import { PRIZE_QTY_MAX, clampQty, type PrizeLogEntry } from "@/lib/wheel-v2/prize-stock";

function fmtTime(at: number): string {
  try {
    return new Date(at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch {
    return "";
  }
}

function logLines(log: PrizeLogEntry[]): string[] {
  return [...log].reverse().map((e) => `#${e.spin}\t${e.prize}\t${fmtTime(e.at)}`);
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const BTN =
  "inline-flex min-h-10 items-center rounded-lg border border-border bg-surface-2 px-3 text-xs font-bold text-foreground outline-none hover:bg-border focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50";

/** Prize wheel only: quantity per prize (finite stock) + winners log with copy/print. */
export function PrizeStockPanel({
  prizes,
  stock,
  log,
  disabled,
  onQty,
  onClearLog,
}: {
  prizes: string[];
  stock: Record<string, number>;
  log: PrizeLogEntry[];
  disabled?: boolean;
  onQty: (prize: string, qty: number) => void;
  onClearLog: () => void;
}) {
  const [note, setNote] = useState("");
  const left = prizes.reduce((s, p) => s + (stock[p.toLocaleLowerCase()] ?? 1), 0);

  const flash = (msg: string) => {
    setNote(msg);
    window.setTimeout(() => setNote(""), 2500);
  };

  const copyLog = async () => {
    if (!log.length) {
      flash("No winners to copy yet.");
      return;
    }
    const text = ["Spin\tPrize\tTime", ...logLines(log)].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      flash("Winners log copied.");
    } catch {
      flash("Could not copy. Select the log and copy it manually.");
    }
  };

  const printLog = () => {
    if (!log.length) {
      flash("No winners to print yet.");
      return;
    }
    const rows = [...log]
      .reverse()
      .map(
        (e) =>
          `<tr><td>${e.spin}</td><td>${escapeHtml(e.prize)}</td><td>${escapeHtml(fmtTime(e.at))}</td></tr>`,
      )
      .join("");
    const w = window.open("", "_blank", "width=640,height=800");
    if (!w) {
      flash("Allow pop-ups to print the log.");
      return;
    }
    w.document.write(
      `<!doctype html><html><head><meta charset="utf-8"><title>Prize winners log</title>` +
        `<style>body{font:14px system-ui,sans-serif;padding:24px}table{border-collapse:collapse;width:100%}` +
        `th,td{border:1px solid #999;padding:6px 10px;text-align:left}th{background:#eee}</style></head>` +
        `<body><h1>Prize winners log</h1><table><thead><tr><th>Spin #</th><th>Prize</th><th>Time</th></tr></thead>` +
        `<tbody>${rows}</tbody></table></body></html>`,
    );
    w.document.close();
    w.focus();
    w.print();
  };

  return (
    <div className="grid w-full gap-3 sm:grid-cols-2">
      <div className="min-w-0 rounded-2xl border border-border bg-surface p-3 sm:p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-extrabold tracking-tight text-foreground">Prize stock</h2>
          <p className="text-xs font-bold tabular-nums text-muted" aria-live="polite">
            {left} left in total
          </p>
        </div>
        <p className="mt-1 text-xs text-muted">
          Set a Quantity for each prize. Each spin that wins uses one; at 0 the prize leaves the
          wheel. Every prize stays one equal slice while it is in stock.
        </p>
        <div className="mt-3 max-h-56 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-[10px] uppercase tracking-wide text-muted">
                <th className="py-1.5 pr-2 font-bold">Prize</th>
                <th className="w-24 py-1.5 font-bold">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {prizes.map((p) => {
                const key = p.toLocaleLowerCase();
                return (
                  <tr key={key} className="border-b border-border/60">
                    <td className="max-w-0 truncate py-1.5 pr-2 font-semibold text-foreground" title={p}>
                      {p}
                    </td>
                    <td className="py-1">
                      <input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={PRIZE_QTY_MAX}
                        step={1}
                        value={stock[key] ?? 1}
                        disabled={disabled}
                        aria-label={`Quantity for ${p}`}
                        onChange={(e) => {
                          if (e.target.value === "") return;
                          onQty(p, clampQty(e.target.value));
                        }}
                        className="h-10 w-20 rounded-lg border border-border bg-surface-2 px-2 text-sm font-bold tabular-nums text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {prizes.length === 0 ? (
            <p className="py-2 text-xs text-muted">Add prizes to the list to set quantities.</p>
          ) : null}
        </div>
      </div>

      <div className="min-w-0 rounded-2xl border border-border bg-surface p-3 sm:p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-extrabold tracking-tight text-foreground">Winners log</h2>
          <p className="text-xs font-bold tabular-nums text-muted">
            {log.length} {log.length === 1 ? "spin" : "spins"}
          </p>
        </div>
        <p className="mt-1 text-xs text-muted">Spin number, prize and time, saved in this browser.</p>
        <div className="mt-3 max-h-56 overflow-y-auto">
          {log.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-3 text-xs text-muted">
              No winners yet. Press SPIN.
            </p>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase tracking-wide text-muted">
                  <th className="py-1.5 pr-2 font-bold">Spin #</th>
                  <th className="py-1.5 pr-2 font-bold">Prize</th>
                  <th className="py-1.5 font-bold">Time</th>
                </tr>
              </thead>
              <tbody>
                {log.map((e) => (
                  <tr key={`${e.spin}-${e.at}`} className="border-b border-border/60">
                    <td className="py-1.5 pr-2 tabular-nums text-muted">{e.spin}</td>
                    <td className="max-w-0 truncate py-1.5 pr-2 font-semibold text-foreground" title={e.prize}>
                      {e.prize}
                    </td>
                    <td className="whitespace-nowrap py-1.5 tabular-nums text-muted">{fmtTime(e.at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className={BTN} onClick={() => void copyLog()}>
            Copy log
          </button>
          <button type="button" className={BTN} onClick={printLog}>
            Print
          </button>
          <button type="button" className={BTN} onClick={onClearLog} disabled={!log.length}>
            Clear log
          </button>
        </div>
        <p className="mt-2 min-h-4 text-xs text-muted" role="status">
          {note}
        </p>
      </div>
    </div>
  );
}
