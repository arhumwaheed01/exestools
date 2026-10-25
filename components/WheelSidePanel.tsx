"use client";

import {
  ChevronLeft,
  ChevronRight,
  ClipboardCopy,
  Eraser,
  ArrowUpDown,
  RotateCcw,
  Shuffle,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { PresetSelector } from "@/components/PresetSelector";
import { ThemeChips } from "@/components/tools/ThemeChips";
import type { WheelPreset } from "@/lib/presets";
import type { ToolThemeId } from "@/lib/tools/theme";

export type PanelTab = "entries" | "results";

type Props = {
  open: boolean;
  onToggle: () => void;
  tab: PanelTab;
  onTab: (tab: PanelTab) => void;
  text: string;
  entryCount: number;
  resultCount: number;
  results: string[];
  onClearResults: () => void;
  disabled?: boolean;
  duplicatesSkipped?: number;
  overLimit?: number;
  heading: string;
  helpText: string;
  raffleHint?: boolean;
  savedNote: string;
  onChange: (text: string) => void;
  onShuffle: () => void;
  onSort: () => void;
  onClear: () => void;
  onRestoreDefaults: () => void;
  onCopy: () => void;
  onFreshWheel: () => void;
  autoRemove: boolean;
  onAutoRemove: (v: boolean) => void;
  showAutoRemove: boolean;
  wheelTitle: string;
  onWheelTitle: (v: string) => void;
  themeChoice: ToolThemeId;
  onThemeChange: (v: ToolThemeId) => void;
  presets: WheelPreset[];
  onPreset: (preset: WheelPreset) => void;
  homeLinks?: { href: string; label: string }[];
  /** Mobile: render as expandable sheet under the wheel. */
  mobileSheet?: boolean;
};

const WHEEL_CAP = 60;

export function WheelSidePanel({
  open,
  onToggle,
  tab,
  onTab,
  text,
  entryCount,
  resultCount,
  results,
  onClearResults,
  disabled,
  duplicatesSkipped = 0,
  overLimit = 0,
  heading,
  helpText,
  raffleHint = false,
  savedNote,
  onChange,
  onShuffle,
  onSort,
  onClear,
  onRestoreDefaults,
  onCopy,
  onFreshWheel,
  autoRemove,
  onAutoRemove,
  showAutoRemove,
  wheelTitle,
  onWheelTitle,
  themeChoice,
  onThemeChange,
  presets,
  onPreset,
  homeLinks,
  mobileSheet = false,
}: Props) {
  const labelId = "wf-choices-label";

  const toggleBtn = (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-sm outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
      aria-expanded={open}
      aria-controls="wheel-side-panel"
      title={open ? "Collapse panel" : "Expand panel"}
    >
      {open ? (
        <ChevronRight className="h-4 w-4" aria-hidden />
      ) : (
        <ChevronLeft className="h-4 w-4" aria-hidden />
      )}
      <span className="sr-only">{open ? "Collapse entries panel" : "Expand entries panel"}</span>
    </button>
  );

  if (mobileSheet) {
    return (
      <div className="lg:hidden">
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-bold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-expanded={open}
          aria-controls="wheel-side-panel-mobile"
        >
          <span>
            Entries & results
            <span className="ml-2 rounded-full bg-surface-2 px-2 py-0.5 text-xs font-bold text-muted">
              {entryCount}
            </span>
          </span>
          <span className="text-muted" aria-hidden>
            {open ? "−" : "+"}
          </span>
        </button>
        {open ? (
          <div
            id="wheel-side-panel-mobile"
            className="mt-2 flex max-h-[min(55svh,28rem)] flex-col overflow-hidden rounded-2xl border border-border bg-surface"
          >
            <PanelBody
              tab={tab}
              onTab={onTab}
              text={text}
              entryCount={entryCount}
              resultCount={resultCount}
              results={results}
              onClearResults={onClearResults}
              disabled={disabled}
              duplicatesSkipped={duplicatesSkipped}
              overLimit={overLimit}
              heading={heading}
              helpText={helpText}
              raffleHint={raffleHint}
              savedNote={savedNote}
              onChange={onChange}
              onShuffle={onShuffle}
              onSort={onSort}
              onClear={onClear}
              onRestoreDefaults={onRestoreDefaults}
              onCopy={onCopy}
              onFreshWheel={onFreshWheel}
              autoRemove={autoRemove}
              onAutoRemove={onAutoRemove}
              showAutoRemove={showAutoRemove}
              wheelTitle={wheelTitle}
              onWheelTitle={onWheelTitle}
              themeChoice={themeChoice}
              onThemeChange={onThemeChange}
              presets={presets}
              onPreset={onPreset}
              homeLinks={homeLinks}
              labelId={labelId}
            />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="relative hidden h-full shrink-0 lg:flex lg:items-stretch">
      <div className="absolute -left-5 top-1/2 z-20 -translate-y-1/2">{toggleBtn}</div>
      <aside
        id="wheel-side-panel"
        className={`flex h-full flex-col overflow-hidden border border-border bg-surface transition-[width,opacity,margin] duration-200 ease-out ${
          open
            ? "w-[320px] opacity-100"
            : "pointer-events-none w-0 border-transparent opacity-0"
        }`}
        aria-hidden={!open}
      >
        {open ? (
          <PanelBody
            tab={tab}
            onTab={onTab}
            text={text}
            entryCount={entryCount}
            resultCount={resultCount}
            results={results}
            onClearResults={onClearResults}
            disabled={disabled}
            duplicatesSkipped={duplicatesSkipped}
            overLimit={overLimit}
            heading={heading}
            helpText={helpText}
            raffleHint={raffleHint}
            savedNote={savedNote}
            onChange={onChange}
            onShuffle={onShuffle}
            onSort={onSort}
            onClear={onClear}
            onRestoreDefaults={onRestoreDefaults}
            onCopy={onCopy}
            onFreshWheel={onFreshWheel}
            autoRemove={autoRemove}
            onAutoRemove={onAutoRemove}
            showAutoRemove={showAutoRemove}
            wheelTitle={wheelTitle}
            onWheelTitle={onWheelTitle}
            themeChoice={themeChoice}
            onThemeChange={onThemeChange}
            presets={presets}
            onPreset={onPreset}
            homeLinks={homeLinks}
            labelId={labelId}
          />
        ) : null}
      </aside>
      {!open ? (
        <div className="flex w-10 flex-col items-center justify-center">{toggleBtn}</div>
      ) : null}
    </div>
  );
}

function PanelBody({
  tab,
  onTab,
  text,
  entryCount,
  resultCount,
  results,
  onClearResults,
  disabled,
  duplicatesSkipped,
  overLimit,
  heading,
  helpText,
  raffleHint,
  savedNote,
  onChange,
  onShuffle,
  onSort,
  onClear,
  onRestoreDefaults,
  onCopy,
  onFreshWheel,
  autoRemove,
  onAutoRemove,
  showAutoRemove,
  wheelTitle,
  onWheelTitle,
  themeChoice,
  onThemeChange,
  presets,
  onPreset,
  homeLinks,
  labelId,
}: Omit<Props, "open" | "onToggle" | "mobileSheet"> & { labelId: string }) {
  return (
    <>
      <div className="flex shrink-0 border-b border-border" role="tablist" aria-label="Panel">
        <TabBtn active={tab === "entries"} onClick={() => onTab("entries")} badge={entryCount}>
          Entries
        </TabBtn>
        <TabBtn active={tab === "results"} onClick={() => onTab("results")} badge={resultCount}>
          Results
        </TabBtn>
      </div>

      {tab === "entries" ? (
        <div className="flex min-h-0 flex-1 flex-col gap-2 p-3">
          <p id={labelId} className="sr-only">
            {heading}
          </p>
          <p className="text-[11px] leading-snug text-muted">{helpText}</p>

          <div className="grid grid-cols-5 gap-1">
            <ToolBtn disabled={disabled} onClick={onShuffle} icon={<Shuffle className="h-3.5 w-3.5" />} label="Shuffle" />
            <ToolBtn
              disabled={disabled}
              onClick={onSort}
              icon={<ArrowUpDown className="h-3.5 w-3.5" />}
              label="Sort"
            />
            <ToolBtn
              disabled={disabled}
              onClick={onCopy}
              icon={<ClipboardCopy className="h-3.5 w-3.5" />}
              label="Copy"
            />
            <ToolBtn
              disabled={disabled}
              onClick={onRestoreDefaults}
              icon={<RotateCcw className="h-3.5 w-3.5" />}
              label="Defaults"
            />
            <ToolBtn
              disabled={disabled}
              onClick={onClear}
              icon={<Eraser className="h-3.5 w-3.5" />}
              label="Clear"
              danger
            />
          </div>

          <label className="sr-only" htmlFor="wf-choices-textarea">
            {heading}
          </label>
          <textarea
            id="wf-choices-textarea"
            aria-labelledby={labelId}
            value={text}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            spellCheck={false}
            placeholder={"Alex\nJordan\nSam\n…"}
            className="min-h-0 w-full flex-1 resize-none rounded-xl border border-border bg-surface-2 px-3 py-2 font-mono text-sm leading-relaxed text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 disabled:opacity-60"
          />

          {(duplicatesSkipped ?? 0) > 0 ? (
            <p className="text-xs font-medium text-amber-300" role="status">
              {duplicatesSkipped} duplicate line{duplicatesSkipped === 1 ? "" : "s"} skipped.
            </p>
          ) : null}
          {(overLimit ?? 0) > 0 ? (
            <p className="text-xs font-medium text-amber-300" role="status">
              Only the first 60 are on the wheel. {overLimit} line
              {overLimit === 1 ? " was" : "s were"} left out.
            </p>
          ) : null}
          {raffleHint && entryCount >= WHEEL_CAP ? (
            <p className="text-xs font-medium text-foreground" role="status">
              Wheel holds {WHEEL_CAP}. Bigger list?{" "}
              <Link href="/raffle-generator" className="font-semibold text-accent hover:underline">
                Try the raffle generator →
              </Link>
            </p>
          ) : null}

          <details className="group rounded-xl border border-border bg-surface-2 open:pb-2">
            <summary className="cursor-pointer list-none px-3 py-2 text-xs font-bold uppercase tracking-wide text-muted outline-none marker:content-none focus-visible:ring-2 focus-visible:ring-accent [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-2">
                Advanced
                <span className="text-muted transition group-open:rotate-45" aria-hidden>
                  +
                </span>
              </span>
            </summary>
            <div className="space-y-3 border-t border-border px-3 pt-3">
              {showAutoRemove ? (
                <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={autoRemove}
                    onChange={(e) => onAutoRemove(e.target.checked)}
                    className="h-4 w-4 accent-cyan-500"
                  />
                  Remove winner after spin
                </label>
              ) : null}
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted">
                  Wheel title
                </span>
                <input
                  type="text"
                  value={wheelTitle}
                  onChange={(e) => onWheelTitle(e.target.value.slice(0, 40))}
                  disabled={disabled}
                  placeholder="e.g. Lunch picker"
                  className="min-h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
                />
              </label>
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Theme</p>
                <ThemeChips value={themeChoice} onChange={onThemeChange} />
              </div>
              <PresetSelector
                presets={presets}
                disabled={disabled}
                onSelect={onPreset}
                homeLinks={homeLinks}
              />
              <p className="text-xs text-muted">
                {savedNote}{" "}
                <Link href="/privacy-policy" className="font-semibold text-accent hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </details>

          <button
            type="button"
            onClick={onFreshWheel}
            disabled={disabled}
            className="mt-auto inline-flex min-h-11 w-full shrink-0 items-center justify-center rounded-xl border border-border bg-surface-2 px-3 text-sm font-bold text-foreground outline-none hover:bg-border focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
          >
            Add wheel
          </button>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3">
          {results.length === 0 ? (
            <p className="text-sm text-muted">No spins yet. Click the wheel or press Ctrl+Enter.</p>
          ) : (
            <ul className="space-y-1.5">
              {results.map((item, i) => (
                <li
                  key={`${item}-${i}`}
                  className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm font-semibold text-foreground"
                >
                  <span className="mr-2 text-xs font-bold text-muted">{i + 1}.</span>
                  {item}
                </li>
              ))}
            </ul>
          )}
          {results.length > 0 ? (
            <button
              type="button"
              onClick={onClearResults}
              className="mt-2 self-start text-sm font-semibold text-muted underline outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Clear results
            </button>
          ) : null}
        </div>
      )}
    </>
  );
}

function TabBtn({
  active,
  onClick,
  badge,
  children,
}: {
  active: boolean;
  onClick: () => void;
  badge: number;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 px-2 py-2.5 text-sm font-bold outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent ${
        active
          ? "border-b-2 border-accent text-foreground"
          : "border-b-2 border-transparent text-muted hover:text-foreground"
      }`}
    >
      {children}
      <span className="rounded-full bg-surface-2 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-muted">
        {badge}
      </span>
    </button>
  );
}

function ToolBtn({
  label,
  icon,
  onClick,
  disabled,
  danger,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex min-h-9 w-full items-center justify-center gap-1 rounded-lg px-1.5 py-1.5 text-[11px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 ${
        danger
          ? "bg-rose-950/60 text-rose-300 hover:bg-rose-900/70"
          : "bg-surface-2 text-foreground hover:bg-border"
      }`}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );
}
