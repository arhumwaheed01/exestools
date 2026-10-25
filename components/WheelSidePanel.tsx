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
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { clampMenuBox, useFullscreenPortalRoot } from "@/lib/wheel-v2/portal";

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
  autoRemove: boolean;
  onAutoRemove: (v: boolean) => void;
  showAutoRemove: boolean;
  /** Mobile: render as expandable sheet under the wheel. */
  mobileSheet?: boolean;
  onAddBackgroundImage?: (file: File) => void;
  onAddCenterImage?: (file: File) => void;
  onAddEntryImage?: (file: File) => void;
  onRemoveBackgroundImage?: () => void;
  onRemoveCenterImage?: () => void;
  hasBackgroundImage?: boolean;
  hasCenterImage?: boolean;
  onSortResults?: () => void;
  onExportResults?: (format: "csv" | "txt") => void;
  onOpenAdvanced?: () => void;
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
  autoRemove,
  onAutoRemove,
  showAutoRemove,
  mobileSheet = false,
  onAddBackgroundImage,
  onAddCenterImage,
  onAddEntryImage,
  onRemoveBackgroundImage,
  onRemoveCenterImage,
  hasBackgroundImage,
  hasCenterImage,
  onSortResults,
  onExportResults,
  onOpenAdvanced,
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
            className="mt-2 flex max-h-[min(50svh,26rem)] flex-col overflow-hidden rounded-2xl border border-border bg-surface"
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
              autoRemove={autoRemove}
              onAutoRemove={onAutoRemove}
              showAutoRemove={showAutoRemove}
              labelId={labelId}
              onAddBackgroundImage={onAddBackgroundImage}
              onAddCenterImage={onAddCenterImage}
              onAddEntryImage={onAddEntryImage}
              onRemoveBackgroundImage={onRemoveBackgroundImage}
              onRemoveCenterImage={onRemoveCenterImage}
              hasBackgroundImage={hasBackgroundImage}
              hasCenterImage={hasCenterImage}
              onSortResults={onSortResults}
              onExportResults={onExportResults}
              onOpenAdvanced={onOpenAdvanced}
            />
          </div>
        ) : null}
      </div>
    );
  }

  // Desktop: when closed, only a single expand chevron (no empty panel shell).
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
        onShuffle={onShuffle}
        onSort={onSort}
        onClear={onClear}
        onRestoreDefaults={onRestoreDefaults}
        onCopy={onCopy}
        autoRemove={autoRemove}
        onAutoRemove={onAutoRemove}
        showAutoRemove={showAutoRemove}
        labelId={labelId}
        onAddBackgroundImage={onAddBackgroundImage}
        onAddCenterImage={onAddCenterImage}
        onAddEntryImage={onAddEntryImage}
        onRemoveBackgroundImage={onRemoveBackgroundImage}
        onRemoveCenterImage={onRemoveCenterImage}
        hasBackgroundImage={hasBackgroundImage}
        hasCenterImage={hasCenterImage}
        onSortResults={onSortResults}
        onExportResults={onExportResults}
        onOpenAdvanced={onOpenAdvanced}
      />
      {/* Fully outside the panel so it never covers Copy / tool buttons */}
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
  onShuffle,
  onSort,
  onClear,
  onRestoreDefaults,
  onCopy,
  autoRemove,
  onAutoRemove,
  showAutoRemove,
  labelId,
  onAddBackgroundImage,
  onAddCenterImage,
  onAddEntryImage,
  onRemoveBackgroundImage,
  onRemoveCenterImage,
  hasBackgroundImage,
  hasCenterImage,
  onSortResults,
  onExportResults,
  onOpenAdvanced,
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

          {showAutoRemove ? (
            <label className="flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 text-sm text-foreground">
              <input
                type="checkbox"
                checked={autoRemove}
                onChange={(e) => onAutoRemove(e.target.checked)}
                className="h-4 w-4 accent-cyan-500"
              />
              Remove winner after spin
            </label>
          ) : null}

          <div className="flex shrink-0 flex-wrap gap-1.5">
            <ToolBtn disabled={disabled} onClick={onShuffle} icon={<Shuffle className="h-3.5 w-3.5" />} label="Shuffle" />
            <ToolBtn
              disabled={disabled}
              onClick={onSort}
              icon={<ArrowUpDown className="h-3.5 w-3.5" />}
              label="Sort"
            />
            <AddImageMenu
              disabled={disabled}
              onBackground={onAddBackgroundImage}
              onCenter={onAddCenterImage}
              onEntry={onAddEntryImage}
              onRemoveBackground={onRemoveBackgroundImage}
              onRemoveCenter={onRemoveCenterImage}
              hasBackground={Boolean(hasBackgroundImage)}
              hasCenter={Boolean(hasCenterImage)}
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
            {onOpenAdvanced ? (
              <ToolBtn disabled={disabled} onClick={onOpenAdvanced} label="Advanced…" />
            ) : null}
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
            className="min-h-[6rem] w-full flex-1 resize-none rounded-xl border border-border bg-surface-2 px-3 py-2 font-mono text-sm leading-relaxed text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 disabled:opacity-60"
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

function AddImageMenu({
  disabled,
  onBackground,
  onCenter,
  onEntry,
  onRemoveBackground,
  onRemoveCenter,
  hasBackground,
  hasCenter,
}: {
  disabled?: boolean;
  onBackground?: (file: File) => void;
  onCenter?: (file: File) => void;
  onEntry?: (file: File) => void;
  onRemoveBackground?: () => void;
  onRemoveCenter?: () => void;
  hasBackground?: boolean;
  hasCenter?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<ReturnType<typeof clampMenuBox> | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLInputElement>(null);
  const centerRef = useRef<HTMLInputElement>(null);
  const entryRef = useRef<HTMLInputElement>(null);
  const portalRoot = useFullscreenPortalRoot();

  useEffect(() => {
    if (!open || !btnRef.current) {
      setPos(null);
      return;
    }
    const place = () => {
      const r = btnRef.current!.getBoundingClientRect();
      setPos(
        clampMenuBox(
          { left: r.left, right: r.right, top: r.top, bottom: r.bottom },
          220,
        ),
      );
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    document.addEventListener("fullscreenchange", place);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      document.removeEventListener("fullscreenchange", place);
    };
  }, [open, portalRoot]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuRef.current?.contains(t) || btnRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const t = window.setTimeout(() => {
      document.addEventListener("mousedown", onDoc);
    }, 0);
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!onBackground && !onCenter && !onEntry) return null;

  const menu =
    portalRoot && open && pos
      ? createPortal(
          <div
            ref={menuRef}
            className="fixed z-[300] max-h-[calc(100dvh-120px)] max-w-[calc(100vw-16px)] overflow-y-auto overscroll-contain rounded-xl border border-border bg-surface p-1.5 shadow-2xl"
            style={{
              left: pos.left,
              width: pos.width,
              maxHeight: pos.maxHeight,
              ...(pos.placement === "above"
                ? { bottom: pos.bottom, top: "auto" }
                : { top: pos.top, bottom: "auto" }),
            }}
            role="menu"
          >
            {onBackground ? (
              <button
                type="button"
                role="menuitem"
                className="flex min-h-11 w-full items-center rounded-lg px-2 text-left text-xs font-semibold hover:bg-surface-2"
                onClick={() => {
                  setOpen(false);
                  window.setTimeout(() => bgRef.current?.click(), 0);
                }}
              >
                Add background image
              </button>
            ) : null}
            {onCenter ? (
              <button
                type="button"
                role="menuitem"
                className="flex min-h-11 w-full items-center rounded-lg px-2 text-left text-xs font-semibold hover:bg-surface-2"
                onClick={() => {
                  setOpen(false);
                  window.setTimeout(() => centerRef.current?.click(), 0);
                }}
              >
                Add center image
              </button>
            ) : null}
            {onEntry ? (
              <button
                type="button"
                role="menuitem"
                className="flex min-h-11 w-full items-center rounded-lg px-2 text-left text-xs font-semibold hover:bg-surface-2"
                onClick={() => {
                  setOpen(false);
                  window.setTimeout(() => entryRef.current?.click(), 0);
                }}
              >
                Add image as entry
              </button>
            ) : null}
            {hasBackground && onRemoveBackground ? (
              <button
                type="button"
                role="menuitem"
                className="flex min-h-11 w-full items-center rounded-lg px-2 text-left text-xs font-semibold text-rose-300 hover:bg-surface-2"
                onClick={() => {
                  setOpen(false);
                  onRemoveBackground();
                }}
              >
                Remove background image
              </button>
            ) : null}
            {hasCenter && onRemoveCenter ? (
              <button
                type="button"
                role="menuitem"
                className="flex min-h-11 w-full items-center rounded-lg px-2 text-left text-xs font-semibold text-rose-300 hover:bg-surface-2"
                onClick={() => {
                  setOpen(false);
                  onRemoveCenter();
                }}
              >
                Remove center image
              </button>
            ) : null}
          </div>,
          portalRoot,
        )
      : null;

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-lg bg-surface-2 px-2.5 py-1.5 text-xs font-semibold text-foreground outline-none hover:bg-border focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
      >
        Add image ▾
      </button>
      {menu}
      <input
        ref={bgRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f && onBackground) onBackground(f);
          e.target.value = "";
        }}
      />
      <input
        ref={centerRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f && onCenter) onCenter(f);
          e.target.value = "";
        }}
      />
      <input
        ref={entryRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f && onEntry) onEntry(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
