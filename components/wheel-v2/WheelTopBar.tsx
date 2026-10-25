"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  Settings2,
} from "lucide-react";
import type { SavedWheelFile } from "@/lib/wheel-v2/settings";

type Props = {
  disabled?: boolean;
  onCustomize: () => void;
  onNew: () => void;
  onSave: () => void;
  onOpenFile: (file: File) => void;
  recent: SavedWheelFile[];
  onOpenRecent: (file: SavedWheelFile) => void;
  onShare: () => void;
  shareUrl: string | null;
  onClearShare: () => void;
  onFullscreen: () => void;
  isFullscreen: boolean;
  onImportCsv: (text: string) => void;
  onPreferences: () => void;
  faqHref?: string;
};

export function WheelTopBar({
  disabled,
  onCustomize,
  onNew,
  onSave,
  onOpenFile,
  recent,
  onOpenRecent,
  onShare,
  shareUrl,
  onClearShare,
  onFullscreen,
  isFullscreen,
  onImportCsv,
  onPreferences,
  faqHref = "#faq",
}: Props) {
  const [openMenu, setOpenMenu] = useState<"open" | "more" | null>(null);
  const [csvOpen, setCsvOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const openId = useId();
  const moreId = useId();

  useEffect(() => {
    if (!openMenu) return;
    const onDoc = (e: MouseEvent) => {
      if (!barRef.current?.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [openMenu]);

  return (
    <div ref={barRef} className="relative z-20">
      <div className="flex flex-wrap items-center gap-1 rounded-2xl border border-border bg-surface px-1.5 py-1 sm:gap-1.5 sm:px-2">
        <BarBtn disabled={disabled} onClick={onCustomize} icon={<Settings2 className="h-3.5 w-3.5" />}>
          Customize
        </BarBtn>
        <BarBtn disabled={disabled} onClick={onNew}>
          New
        </BarBtn>
        <div className="relative">
          <BarBtn
            disabled={disabled}
            onClick={() => setOpenMenu((m) => (m === "open" ? null : "open"))}
            aria-expanded={openMenu === "open"}
            aria-controls={openId}
          >
            Open
            <ChevronDown className="h-3.5 w-3.5 opacity-70" aria-hidden />
          </BarBtn>
          {openMenu === "open" ? (
            <div
              id={openId}
              className="absolute left-0 top-full z-30 mt-1 w-64 rounded-xl border border-border bg-surface p-2 shadow-xl"
            >
              <button
                type="button"
                className="flex min-h-10 w-full items-center rounded-lg px-2 text-left text-sm font-semibold hover:bg-surface-2"
                onClick={() => {
                  fileRef.current?.click();
                  setOpenMenu(null);
                }}
              >
                Open JSON file…
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onOpenFile(f);
                  e.target.value = "";
                }}
              />
              {recent.length > 0 ? (
                <>
                  <p className="mt-2 px-2 text-[10px] font-bold uppercase tracking-wide text-muted">
                    Recently saved
                  </p>
                  <ul className="mt-1 max-h-40 overflow-y-auto">
                    {recent.map((r) => (
                      <li key={r.savedAt}>
                        <button
                          type="button"
                          className="flex min-h-9 w-full flex-col rounded-lg px-2 py-1 text-left hover:bg-surface-2"
                          onClick={() => {
                            onOpenRecent(r);
                            setOpenMenu(null);
                          }}
                        >
                          <span className="truncate text-sm font-semibold text-foreground">
                            {r.title || "Untitled wheel"}
                          </span>
                          <span className="text-[10px] text-muted">
                            {r.choices.length} entries ·{" "}
                            {new Date(r.savedAt).toLocaleString()}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="mt-2 px-2 text-xs text-muted">No recent wheels yet.</p>
              )}
            </div>
          ) : null}
        </div>
        <BarBtn disabled={disabled} onClick={onSave}>
          Save
        </BarBtn>
        <BarBtn disabled={disabled} onClick={onShare}>
          Share
        </BarBtn>
        <Link
          href="/wheel-gallery"
          className="inline-flex min-h-9 items-center rounded-lg px-2.5 text-xs font-bold text-foreground outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
        >
          Gallery
        </Link>
        <button
          type="button"
          disabled={disabled}
          onClick={onFullscreen}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-foreground outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
          aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" aria-hidden />
          ) : (
            <Maximize2 className="h-4 w-4" aria-hidden />
          )}
        </button>
        <div className="relative ml-auto">
          <BarBtn
            disabled={disabled}
            onClick={() => setOpenMenu((m) => (m === "more" ? null : "more"))}
            aria-expanded={openMenu === "more"}
            aria-controls={moreId}
          >
            More
            <ChevronDown className="h-3.5 w-3.5 opacity-70" aria-hidden />
          </BarBtn>
          {openMenu === "more" ? (
            <div
              id={moreId}
              className="absolute right-0 top-full z-30 mt-1 w-56 rounded-xl border border-border bg-surface p-1.5 shadow-xl"
            >
              <a
                href="mailto:hello@exestools.com?subject=Spinner%20wheel%20feedback"
                className="flex min-h-10 items-center rounded-lg px-2 text-sm font-semibold hover:bg-surface-2"
                onClick={() => setOpenMenu(null)}
              >
                Feedback
              </a>
              <a
                href={faqHref}
                className="flex min-h-10 items-center rounded-lg px-2 text-sm font-semibold hover:bg-surface-2"
                onClick={() => setOpenMenu(null)}
              >
                FAQ
              </a>
              <button
                type="button"
                className="flex min-h-10 w-full items-center rounded-lg px-2 text-left text-sm font-semibold hover:bg-surface-2"
                onClick={() => {
                  setOpenMenu(null);
                  setCsvOpen(true);
                }}
              >
                Import from pasted CSV
              </button>
              <button
                type="button"
                className="flex min-h-10 w-full items-center rounded-lg px-2 text-left text-sm font-semibold hover:bg-surface-2"
                onClick={() => {
                  setOpenMenu(null);
                  onPreferences();
                }}
              >
                Preferences
              </button>
              <p className="flex items-center gap-1 px-2 py-2 text-xs text-muted">
                <MoreHorizontal className="h-3.5 w-3.5" aria-hidden />
                More options
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {shareUrl ? (
        <div className="mt-2 flex flex-col gap-2 rounded-xl border border-border bg-surface-2 p-3 sm:flex-row sm:items-center">
          <input
            readOnly
            value={shareUrl}
            className="min-h-10 flex-1 truncate rounded-lg border border-border bg-surface px-3 text-xs text-foreground"
            onFocus={(e) => e.currentTarget.select()}
          />
          <button
            type="button"
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-accent-strong px-3 text-xs font-bold text-slate-950"
            onClick={() => void navigator.clipboard.writeText(shareUrl)}
          >
            Copy link
          </button>
          <button
            type="button"
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-border px-3 text-xs font-bold"
            onClick={onClearShare}
          >
            Close
          </button>
        </div>
      ) : null}

      {csvOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-4 shadow-2xl">
            <h3 className="text-sm font-extrabold">Import from pasted CSV</h3>
            <p className="mt-1 text-xs text-muted">
              One name per line, or comma-separated values.
            </p>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              rows={6}
              className="mt-3 w-full rounded-xl border border-border bg-surface-2 p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
              placeholder="Alex, Jordan, Sam"
            />
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                className="min-h-10 rounded-lg border border-border px-3 text-sm font-bold"
                onClick={() => {
                  setCsvOpen(false);
                  setCsvText("");
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="min-h-10 rounded-lg bg-accent-strong px-3 text-sm font-bold text-slate-950"
                onClick={() => {
                  onImportCsv(csvText);
                  setCsvOpen(false);
                  setCsvText("");
                }}
              >
                Import
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function BarBtn({
  children,
  onClick,
  disabled,
  icon,
  ...rest
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2.5 text-xs font-bold text-foreground outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
