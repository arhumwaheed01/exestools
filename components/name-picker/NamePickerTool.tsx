"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { QueryHydratedSpinner } from "@/components/QueryHydratedMounts";
import {
  NP_MODE_EVENT,
  NP_MODE_STORAGE_KEY,
  NP_NAMES_EVENT,
  NP_SET_TEXT_EVENT,
  emitNamePickerEvent,
  type NamePickerMode,
} from "@/lib/name-picker-bridge";
import { defaultChoicesForTool } from "@/lib/presets";
import { shuffle } from "@/lib/random";
import { loadSession, saveSession } from "@/lib/spinner-storage";
import { choicesToText, parseChoicesWithStats } from "@/lib/wheel";

const TOOL_ID = "random-name-picker" as const;
const DEFAULT_COUNT = 3;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function printList(names: string[]): void {
  const items = names.map((n) => `<li>${escapeHtml(n)}</li>`).join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Random order</title>
<style>body{font:18px/1.5 system-ui,sans-serif;margin:2rem}h1{font-size:1.25rem}ol{padding-left:2rem}li{margin:.25rem 0}</style>
</head><body><h1>Random order</h1><ol>${items}</ol></body></html>`;
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
  document.body.appendChild(frame);
  const doc = frame.contentDocument;
  const win = frame.contentWindow;
  if (!doc || !win) {
    frame.remove();
    return;
  }
  doc.open();
  doc.write(html);
  doc.close();
  const cleanup = () => window.setTimeout(() => frame.remove(), 1000);
  win.addEventListener("afterprint", cleanup);
  window.setTimeout(() => {
    win.focus();
    win.print();
    // Fallback in case afterprint never fires.
    window.setTimeout(() => frame.remove(), 60_000);
  }, 50);
}

/**
 * Name picker controls. Rendered by the server page outside the Suspense boundary that
 * wraps the interactive wheel, so the mode toggle and "How many names" input are part of
 * the initial HTML. The wheel is mounted below and stays in sync through the list bridge.
 */
export function NamePickerTool() {
  const uid = useId();
  const [mode, setMode] = useState<NamePickerMode>("list");
  const [text, setText] = useState(() => choicesToText(defaultChoicesForTool(TOOL_ID)));
  const [countStr, setCountStr] = useState(String(DEFAULT_COUNT));
  const [result, setResult] = useState<string[] | null>(null);
  const [note, setNote] = useState("");
  const noteTimer = useRef<number | null>(null);

  const names = useMemo(() => parseChoicesWithStats(text).choices, [text]);
  const namesRef = useRef<string[]>([]);
  useEffect(() => {
    namesRef.current = names;
  }, [names]);
  const total = names.length;

  const parsedCount = Number.parseInt(countStr, 10);
  const count =
    total === 0
      ? 0
      : Math.min(total, Math.max(1, Number.isFinite(parsedCount) ? parsedCount : DEFAULT_COUNT));

  const flash = useCallback((msg: string) => {
    setNote(msg);
    if (noteTimer.current) window.clearTimeout(noteTimer.current);
    noteTimer.current = window.setTimeout(() => setNote(""), 2500);
  }, []);

  const changeMode = useCallback((next: NamePickerMode) => {
    setMode(next);
    try {
      localStorage.setItem(NP_MODE_STORAGE_KEY, next);
    } catch {
      /* private mode */
    }
  }, []);

  // After hydration: restore last mode + saved list. Share links always open the wheel.
  useEffect(() => {
    // Deferred so the first client render matches the server HTML exactly.
    queueMicrotask(() => {
      try {
        const url = new URL(window.location.href);
        const sharedLink =
          url.hash.startsWith("#w=") ||
          url.searchParams.has("c") ||
          url.searchParams.has("preset");
        const saved = localStorage.getItem(NP_MODE_STORAGE_KEY);
        if (sharedLink) setMode("spin");
        else if (saved === "spin" || saved === "list") setMode(saved);
      } catch {
        /* ignore */
      }
      const session = loadSession(TOOL_ID);
      if (session?.choices?.length) setText(choicesToText(session.choices));
    });
  }, []);

  useEffect(() => {
    const onNames = (e: Event) => {
      const list = (e as CustomEvent<string[]>).detail;
      if (!Array.isArray(list)) return;
      const current = namesRef.current;
      if (list.length === current.length && list.every((n, i) => n === current[i])) return;
      setText(choicesToText(list));
    };
    const onMode = (e: Event) => {
      const next = (e as CustomEvent<NamePickerMode>).detail;
      if (next === "spin" || next === "list") changeMode(next);
    };
    window.addEventListener(NP_NAMES_EVENT, onNames);
    window.addEventListener(NP_MODE_EVENT, onMode);
    return () => {
      window.removeEventListener(NP_NAMES_EVENT, onNames);
      window.removeEventListener(NP_MODE_EVENT, onMode);
      if (noteTimer.current) window.clearTimeout(noteTimer.current);
    };
  }, [changeMode]);

  const onTextChange = (raw: string) => {
    setText(raw);
    saveSession(TOOL_ID, parseChoicesWithStats(raw).choices);
    emitNamePickerEvent(NP_SET_TEXT_EVENT, raw);
  };

  const draw = (n: number) => {
    if (total === 0) return;
    // Fisher–Yates over the whole list (crypto-backed), then take the first n: no repeats.
    setResult(shuffle(names).slice(0, Math.min(n, total)));
  };

  const onDrawCount = () => draw(count);
  const onWholeList = () => draw(total);

  const onCopy = async () => {
    if (!result) return;
    const body = result.map((n, i) => `${i + 1}. ${n}`).join("\n");
    try {
      await navigator.clipboard.writeText(body);
      flash("List copied.");
    } catch {
      flash("Could not copy. Select the list and copy it by hand.");
    }
  };

  const onPrint = () => {
    if (result) printList(result);
  };

  const segBase =
    "inline-flex min-h-11 flex-1 items-center justify-center rounded-lg px-3 text-sm font-bold outline-none focus-visible:ring-2 focus-visible:ring-accent";
  const segOn = "bg-accent-strong text-slate-950";
  const segOff = "text-foreground hover:bg-border";
  const btnPrimary =
    "inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-accent-strong px-4 text-base font-extrabold text-slate-950 outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto";
  const btnSecondary =
    "inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-border bg-surface-2 px-4 text-sm font-bold text-foreground outline-none hover:bg-border focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto";

  const countId = `${uid}-count`;
  const namesId = `${uid}-names`;
  const listMode = mode === "list";

  return (
    <div className="w-full min-w-0 max-w-full space-y-3">
      <div
        role="group"
        aria-label="Name picker mode"
        className="flex w-full gap-1 rounded-xl border border-border bg-surface p-1 sm:max-w-md"
      >
        <button
          type="button"
          aria-pressed={!listMode}
          onClick={() => changeMode("spin")}
          className={`${segBase} ${!listMode ? segOn : segOff}`}
        >
          Spin one
        </button>
        <button
          type="button"
          aria-pressed={listMode}
          onClick={() => changeMode("list")}
          className={`${segBase} ${listMode ? segOn : segOff}`}
        >
          Draw a list
        </button>
      </div>

      <section
        aria-label="Draw a list of names"
        className={`w-full min-w-0 rounded-2xl border border-border bg-surface p-3 sm:p-4 ${
          listMode ? "" : "hidden"
        }`}
      >
        <h2 className="text-base font-extrabold tracking-tight text-foreground">
          Draw several names at once
        </h2>
        <p className="mt-1 text-xs text-muted">
          Pick a few names, or put everyone in a random speaking order. Names are drawn without
          repeats, so each person shows up once in the list.
        </p>

        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <div className="min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <label htmlFor={namesId} className="text-sm font-bold text-foreground">
                Your names
              </label>
              <span className="text-xs font-bold tabular-nums text-muted">
                {total} {total === 1 ? "name" : "names"}
              </span>
            </div>
            <textarea
              id={namesId}
              value={text}
              onChange={(e) => onTextChange(e.target.value)}
              rows={7}
              spellCheck={false}
              placeholder={"Alex\nJordan\nSam\n…"}
              className="mt-1 min-h-[9rem] w-full resize-y rounded-xl border border-border bg-surface-2 px-3 py-2.5 font-mono text-sm leading-relaxed text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
            <p className="mt-1 text-xs text-muted">
              One name per line, up to 60. Repeats are skipped. Add an initial if two people share a
              name.
            </p>
          </div>

          <div className="min-w-0 space-y-3">
            <div>
              <label htmlFor={countId} className="text-sm font-bold text-foreground">
                How many names?
              </label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  id={countId}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={Math.max(1, total)}
                  step={1}
                  value={countStr}
                  onChange={(e) => setCountStr(e.target.value)}
                  onBlur={() => setCountStr(String(count || DEFAULT_COUNT))}
                  className="min-h-12 w-24 rounded-xl border border-border bg-surface-2 px-3 text-base font-bold tabular-nums text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
                />
                <span className="text-xs text-muted">of {total} (1 to {Math.max(1, total)})</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <button type="button" onClick={onDrawCount} disabled={total === 0} className={btnPrimary}>
                {count > 0 ? `Draw ${count} ${count === 1 ? "name" : "names"}` : "Draw names"}
              </button>
              <button type="button" onClick={onWholeList} disabled={total === 0} className={btnSecondary}>
                Put the whole list in random order
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 border-t border-border pt-3" aria-live="polite">
          {result ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-extrabold text-foreground">
                  {result.length === total
                    ? `Random order (all ${total})`
                    : `Drew ${result.length} of ${total}`}
                </h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void onCopy()}
                    className="inline-flex min-h-11 items-center rounded-lg border border-border bg-surface-2 px-3 text-sm font-bold text-foreground outline-none hover:bg-border focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    Copy list
                  </button>
                  <button
                    type="button"
                    onClick={onPrint}
                    className="inline-flex min-h-11 items-center rounded-lg border border-border bg-surface-2 px-3 text-sm font-bold text-foreground outline-none hover:bg-border focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    Print
                  </button>
                </div>
              </div>
              <ol className="mt-2 max-h-80 list-decimal space-y-1 overflow-y-auto pl-7 text-base font-semibold text-foreground marker:font-bold marker:text-accent">
                {result.map((name, i) => (
                  <li key={`${i}-${name}`} className="break-words pl-1">
                    {name}
                  </li>
                ))}
              </ol>
              {note ? (
                <p className="mt-2 text-xs font-semibold text-muted" role="status">
                  {note}
                </p>
              ) : null}
            </>
          ) : (
            <p className="text-xs text-muted">
              Your drawn list shows up here as 1., 2., 3. in the order names came out.
            </p>
          )}
        </div>
      </section>

      {/* Wheel stays mounted (list + session intact) but is out of the way in list mode. */}
      <div className={listMode ? "hidden" : ""}>
        <QueryHydratedSpinner toolId={TOOL_ID} />
      </div>
    </div>
  );
}
