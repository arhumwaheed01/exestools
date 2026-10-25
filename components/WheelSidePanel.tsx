"use client";

import { ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

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
  /** Mobile: render as expandable sheet under the wheel. */
  mobileSheet?: boolean;
  onSortResults?: () => void;
  onExportResults?: (format: "csv" | "txt") => void;
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
  mobileSheet = false,
  onSortResults,
  onExportResults,
}: Props) {
  const labelId = "wf-choices-label";

  if (mobileSheet) {
    return (
      <div className="lg:hidden">
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full scroll-mb-24 items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-bold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
            className="mt-2 flex max-h-[min(70svh,34rem)] flex-col overflow-hidden rounded-2xl border border-border bg-surface"
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
              labelId={labelId}
              onSortResults={onSortResults}
              onExportResults={onExportResults}
            />
          </div>
        ) : null}
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="relative z-20 hidden h-11 w-11 shrink-0 self-center rounded-full border border-border bg-surface text-foreground shadow-sm outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent lg:inline-flex lg:items-center lg:justify-center"
        aria-expanded={false}
        aria-controls="wheel-side-panel"
        title="Expand panel"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        <span className="sr-only">Expand entries panel</span>
      </button>
    );
  }

  return (
    <aside
      id="wheel-side-panel"
      className="relative hidden h-full min-h-0 w-[320px] shrink-0 flex-col overflow-hidden rounded-r-3xl border border-border border-l-0 bg-surface lg:flex"
      aria-hidden={false}
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
        labelId={labelId}
        onSortResults={onSortResults}
        onExportResults={onExportResults}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-full top-1/2 z-20 mr-1.5 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-sm outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
        aria-expanded={true}
        aria-controls="wheel-side-panel"
        title="Collapse panel"
      >
        <ChevronRight className="h-4 w-4" aria-hidden />
        <span className="sr-only">Collapse entries panel</span>
      </button>
    </aside>
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
  labelId,
  onSortResults,
  onExportResults,
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
        <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden p-2.5">
          <p id={labelId} className="sr-only">
            {heading}
          </p>
          <p className="shrink-0 text-[11px] leading-snug text-muted">{helpText}</p>
          <p className="shrink-0 text-[11px] leading-snug text-muted">
            {savedNote}{" "}
            <Link href="/privacy-policy" className="font-semibold text-accent hover:underline">
              Privacy Policy
            </Link>
          </p>

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
            className="min-h-[12rem] w-full flex-1 resize-none rounded-xl border border-border bg-surface-2 px-3 py-2 font-mono text-sm leading-relaxed text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 disabled:opacity-60"
          />

          {(duplicatesSkipped ?? 0) > 0 ? (
            <p className="shrink-0 text-xs font-medium text-amber-300" role="status">
              {duplicatesSkipped} duplicate line{duplicatesSkipped === 1 ? "" : "s"} skipped.
            </p>
          ) : null}
          {(overLimit ?? 0) > 0 ? (
            <p className="shrink-0 text-xs font-medium text-amber-300" role="status">
              Only the first 60 are on the wheel. {overLimit} line
              {overLimit === 1 ? " was" : "s were"} left out.
            </p>
          ) : null}
          {raffleHint && entryCount >= WHEEL_CAP ? (
            <p className="shrink-0 text-xs font-medium text-foreground" role="status">
              Wheel holds {WHEEL_CAP}. Bigger list?{" "}
              <Link href="/raffle-generator" className="font-semibold text-accent hover:underline">
                Try the raffle generator →
              </Link>
            </p>
          ) : null}
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3">
          {results.length > 0 ? (
            <div className="flex shrink-0 flex-wrap gap-1.5">
              {onSortResults ? (
                <ToolBtn
                  disabled={disabled}
                  onClick={onSortResults}
                  icon={<ArrowUpDown className="h-3.5 w-3.5" />}
                  label="Sort"
                />
              ) : null}
              <ToolBtn disabled={disabled} onClick={onClearResults} label="Clear the list" danger />
              {onExportResults ? (
                <>
                  <ToolBtn
                    disabled={disabled}
                    onClick={() => onExportResults("csv")}
                    label="Export CSV"
                  />
                  <ToolBtn
                    disabled={disabled}
                    onClick={() => onExportResults("txt")}
                    label="Export TXT"
                  />
                </>
              ) : null}
            </div>
          ) : null}
          {results.length === 0 ? (
            <p className="text-sm text-muted">
              No spins yet. Results stay for this session only (cleared on reload). Click the wheel
              or press Ctrl+Enter.
            </p>
          ) : (
            <ul className="space-y-1.5">
              <li className="list-none text-[11px] text-muted">
                Session only — cleared if you reload the page.
              </li>
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
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 ${
        danger
          ? "bg-rose-950/60 text-rose-300 hover:bg-rose-900/70"
          : "bg-surface-2 text-foreground hover:bg-border"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
