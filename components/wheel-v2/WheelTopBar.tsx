"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  ChevronDown,
  Maximize2,
  Minimize2,
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
  compact?: boolean;
};

type MenuPos = { top: number; left: number; right?: number; width: number };

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
  compact = false,
}: Props) {
  const [openMenu, setOpenMenu] = useState<"open" | "more" | null>(null);
  const [csvOpen, setCsvOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [mounted, setMounted] = useState(false);
  const [menuPos, setMenuPos] = useState<MenuPos | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const openBtnRef = useRef<HTMLButtonElement>(null);
  const moreBtnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const openId = useId();
  const moreId = useId();

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!openMenu) {
      setMenuPos(null);
      return;
    }
    const btn = openMenu === "open" ? openBtnRef.current : moreBtnRef.current;
    if (!btn) return;
    const place = () => {
      const r = btn.getBoundingClientRect();
      if (openMenu === "more") {
        setMenuPos({
          top: r.bottom + 4,
          left: Math.max(8, r.right - 224),
          width: 224,
        });
      } else {
        setMenuPos({
          top: r.bottom + 4,
          left: Math.min(r.left, window.innerWidth - 272),
          width: 256,
        });
      }
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [openMenu]);

  useEffect(() => {
    if (!openMenu) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuRef.current?.contains(t)) return;
      if (openBtnRef.current?.contains(t) || moreBtnRef.current?.contains(t)) return;
      setOpenMenu(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [openMenu]);

  const triggerOpenFile = () => {
    setOpenMenu(null);
    window.setTimeout(() => fileRef.current?.click(), 0);
  };

  const menuPortal =
    mounted && openMenu && menuPos
      ? createPortal(
          <div
            ref={menuRef}
            id={openMenu === "open" ? openId : moreId}
            role="menu"
            className="fixed z-[200] rounded-xl border border-border bg-surface p-1.5 shadow-2xl"
            style={{
              top: menuPos.top,
              left: menuPos.left,
              width: menuPos.width,
            }}
          >
            {openMenu === "open" ? (
              <>
                <button
                  type="button"
                  role="menuitem"
                  className="flex min-h-10 w-full items-center rounded-lg px-2 text-left text-sm font-semibold hover:bg-surface-2"
                  onClick={triggerOpenFile}
                >
                  Open JSON file…
                </button>
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
                            role="menuitem"
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
              </>
            ) : (
              <>
                <a
                  href="mailto:hello@exestools.com?subject=Spinner%20wheel%20feedback"
                  role="menuitem"
                  className="flex min-h-10 items-center rounded-lg px-2 text-sm font-semibold hover:bg-surface-2"
                  onClick={() => setOpenMenu(null)}
                >
                  Feedback
                </a>
                <a
                  href={faqHref}
                  role="menuitem"
                  className="flex min-h-10 items-center rounded-lg px-2 text-sm font-semibold hover:bg-surface-2"
                  onClick={() => setOpenMenu(null)}
                >
                  FAQ
                </a>
                <button
                  type="button"
                  role="menuitem"
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
                  role="menuitem"
                  className="flex min-h-10 w-full items-center rounded-lg px-2 text-left text-sm font-semibold hover:bg-surface-2"
                  onClick={() => {
                    setOpenMenu(null);
                    onPreferences();
                  }}
                >
                  Preferences
                </button>
              </>
            )}
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="relative w-full">
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

      {/* No overflow clip on the button row — menus are portaled */}
      <div
        className={`flex w-full items-center gap-1 rounded-2xl border border-border bg-surface px-1.5 py-1 sm:gap-1.5 sm:px-2 ${
          compact ? "flex-nowrap" : "flex-wrap"
        }`}
      >
        <BarBtn disabled={disabled} onClick={onCustomize} icon={<Settings2 className="h-3.5 w-3.5" />}>
          Customize
        </BarBtn>
        <BarBtn disabled={disabled} onClick={onNew}>
          New
        </BarBtn>
        <BarBtn
          ref={openBtnRef}
          disabled={disabled}
          onClick={() => setOpenMenu((m) => (m === "open" ? null : "open"))}
          aria-expanded={openMenu === "open"}
          aria-controls={openId}
          aria-haspopup="menu"
        >
          Open
          <ChevronDown className="h-3.5 w-3.5 opacity-70" aria-hidden />
        </BarBtn>
        <BarBtn disabled={disabled} onClick={onSave}>
          Save
        </BarBtn>
        <BarBtn disabled={disabled} onClick={onShare}>
          Share
        </BarBtn>
        <Link
          href="/wheel-gallery"
          className="inline-flex min-h-9 shrink-0 items-center rounded-lg px-2.5 text-xs font-bold text-foreground outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
        >
          Gallery
        </Link>
        <button
          type="button"
          disabled={disabled}
          onClick={onFullscreen}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-foreground outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
          aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" aria-hidden />
          ) : (
            <Maximize2 className="h-4 w-4" aria-hidden />
          )}
        </button>
        <BarBtn
          ref={moreBtnRef}
          disabled={disabled}
          className="ml-auto"
          onClick={() => setOpenMenu((m) => (m === "more" ? null : "more"))}
          aria-expanded={openMenu === "more"}
          aria-controls={moreId}
          aria-haspopup="menu"
        >
          More
          <ChevronDown className="h-3.5 w-3.5 opacity-70" aria-hidden />
        </BarBtn>
      </div>

      {menuPortal}

      {shareUrl ? (
        <div className="mt-2 flex w-full flex-col gap-2 rounded-xl border border-border bg-surface-2 p-3 sm:flex-row sm:items-center">
          <input
            readOnly
            value={shareUrl}
            className="min-h-10 min-w-0 flex-1 truncate rounded-lg border border-border bg-surface px-3 text-xs text-foreground"
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

      {mounted && csvOpen
        ? createPortal(
            <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/70 p-4">
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
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

const BarBtn = ({
  children,
  onClick,
  disabled,
  icon,
  className = "",
  ref,
  ...rest
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
  ref?: React.Ref<HTMLButtonElement>;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    ref={ref}
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={`inline-flex min-h-9 shrink-0 items-center gap-1 rounded-lg px-2.5 text-xs font-bold text-foreground outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 ${className}`}
    {...rest}
  >
    {icon}
    {children}
  </button>
);
