"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  ArrowUpDown,
  ChevronDown,
  ClipboardCopy,
  Eraser,
  Maximize2,
  RotateCcw,
  Settings2,
  Shuffle,
  Trash2,
} from "lucide-react";
import type { WheelPreset } from "@/lib/presets";
import type { SavedWheelFile } from "@/lib/wheel-v2/settings";
import {
  clampMenuBox,
  parseCsvEntries,
  useFullscreenPortalRoot,
} from "@/lib/wheel-v2/portal";

export type SaveWheelOpts = { title: string; download: boolean };

type Props = {
  disabled?: boolean;
  onCustomize: () => void;
  onNew: () => void;
  onSave: (opts: SaveWheelOpts) => void;
  onOpenFile: (file: File) => void;
  recent: SavedWheelFile[];
  onOpenRecent: (file: SavedWheelFile) => void;
  onDeleteRecent?: (savedAt: number) => void;
  defaultSaveTitle?: string;
  onShare: () => void;
  shareUrl: string | null;
  onClearShare: () => void;
  onFullscreen: () => void;
  isFullscreen: boolean;
  /** Return false to keep the CSV dialog open (validation failed). */
  onImportCsv: (text: string) => boolean;
  onPreferences: () => void;
  faqHref?: string;
  compact?: boolean;
  onAddWheel: () => void;
  presets: WheelPreset[];
  onPreset: (preset: WheelPreset) => void;
  homeLinks?: { href: string; label: string }[];
  onShuffle: () => void;
  onSort: () => void;
  onClear: () => void;
  onRestoreDefaults: () => void;
  onCopy: () => void;
  onOpenAdvanced: () => void;
  autoRemove: boolean;
  onAutoRemove: (v: boolean) => void;
  showAutoRemove: boolean;
  onAddBackgroundImage?: (file: File) => void;
  onAddCenterImage?: (file: File) => void;
  onAddEntryImage?: (file: File) => void;
  onRemoveBackgroundImage?: () => void;
  onRemoveCenterImage?: () => void;
  hasBackgroundImage?: boolean;
  hasCenterImage?: boolean;
};

type MenuKind = "open" | "more" | "examples" | "add-image" | null;

type MenuPos = {
  left: number;
  width: number;
  maxHeight: number;
  placement: "below" | "above";
  top?: number;
  bottom?: number;
};

export function WheelTopBar({
  disabled,
  onCustomize,
  onNew,
  onSave,
  onOpenFile,
  recent,
  onOpenRecent,
  onDeleteRecent,
  defaultSaveTitle = "My wheel",
  onShare,
  shareUrl,
  onClearShare,
  onFullscreen,
  isFullscreen,
  onImportCsv,
  onPreferences,
  faqHref = "#faq",
  compact: _compact = false,
  onAddWheel,
  presets,
  onPreset,
  homeLinks,
  onShuffle,
  onSort,
  onClear,
  onRestoreDefaults,
  onCopy,
  onOpenAdvanced,
  autoRemove,
  onAutoRemove,
  showAutoRemove,
  onAddBackgroundImage,
  onAddCenterImage,
  onAddEntryImage,
  onRemoveBackgroundImage,
  onRemoveCenterImage,
  hasBackgroundImage,
  hasCenterImage,
}: Props) {
  void _compact;
  const [openMenu, setOpenMenu] = useState<MenuKind>(null);
  const [csvOpen, setCsvOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [csvError, setCsvError] = useState("");
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState(defaultSaveTitle);
  const [saveDownload, setSaveDownload] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [menuPos, setMenuPos] = useState<MenuPos | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const saveTitleRef = useRef<HTMLInputElement>(null);
  const openBtnRef = useRef<HTMLButtonElement>(null);
  const moreBtnRef = useRef<HTMLButtonElement>(null);
  const examplesBtnRef = useRef<HTMLButtonElement>(null);
  const addImageBtnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLInputElement>(null);
  const centerRef = useRef<HTMLInputElement>(null);
  const entryRef = useRef<HTMLInputElement>(null);
  const openId = useId();
  const moreId = useId();
  const examplesId = useId();
  const addImageId = useId();
  const portalRoot = useFullscreenPortalRoot();

  useLayoutEffect(() => {
    if (!openMenu) {
      setMenuPos(null);
      return;
    }
    const btn =
      openMenu === "open"
        ? openBtnRef.current
        : openMenu === "examples"
          ? examplesBtnRef.current ?? moreBtnRef.current
          : openMenu === "add-image"
            ? addImageBtnRef.current ?? moreBtnRef.current
            : moreBtnRef.current;
    if (!btn) return;
    const place = () => {
      const r = btn.getBoundingClientRect();
      const desired =
        openMenu === "examples" ? 288 : openMenu === "add-image" ? 220 : openMenu === "more" ? 240 : 256;
      setMenuPos(
        clampMenuBox(
          { left: r.left, right: r.right, top: r.top, bottom: r.bottom },
          desired,
          {
            preferRightAlign:
              openMenu === "more" || openMenu === "examples" || openMenu === "add-image",
          },
        ),
      );
    };
    place();
    requestAnimationFrame(place);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    document.addEventListener("fullscreenchange", place);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      document.removeEventListener("fullscreenchange", place);
    };
  }, [openMenu, portalRoot, recent.length, presets.length]);

  useEffect(() => {
    if (!openMenu) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuRef.current?.contains(t)) return;
      if (openBtnRef.current?.contains(t) || moreBtnRef.current?.contains(t)) return;
      if (examplesBtnRef.current?.contains(t) || addImageBtnRef.current?.contains(t)) return;
      setOpenMenu(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
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
  }, [openMenu]);

  useEffect(() => {
    if (!csvOpen && !saveOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (csvOpen) {
        setCsvOpen(false);
        setCsvText("");
        setCsvError("");
      }
      if (saveOpen) {
        setSaveOpen(false);
        setSaveError("");
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [csvOpen, saveOpen]);

  useEffect(() => {
    if (!saveOpen) return;
    const t = window.setTimeout(() => {
      saveTitleRef.current?.focus();
      saveTitleRef.current?.select();
    }, 50);
    return () => window.clearTimeout(t);
  }, [saveOpen]);

  const commitSave = () => {
    const title = saveTitle.trim() || "My wheel";
    const dup = recent.some(
      (r) => r.title.trim().toLocaleLowerCase() === title.toLocaleLowerCase(),
    );
    if (dup) {
      setSaveError(`“${title}” is already saved. Pick a new name or delete the old one.`);
      return;
    }
    onSave({ title, download: saveDownload });
    setSaveOpen(false);
    setSaveError("");
  };

  const triggerOpenFile = () => {
    setOpenMenu(null);
    window.setTimeout(() => fileRef.current?.click(), 0);
  };

  const runAndClose = (fn: () => void) => {
    setOpenMenu(null);
    fn();
  };

  const examplesMenuBody = (
    <>
      <p className="px-2 pb-1 pt-0.5 text-[10px] font-bold uppercase tracking-wide text-muted">
        Example wheels
      </p>
      <p className="px-2 pb-2 text-xs text-muted">Load a starter list, then customize freely.</p>
      {presets.map((p) => (
        <button
          key={p.id}
          type="button"
          role="menuitem"
          className="flex min-h-11 w-full flex-col rounded-lg px-2 py-1.5 text-left hover:bg-surface-2"
          onClick={() => runAndClose(() => onPreset(p))}
        >
          <span className="text-sm font-semibold text-foreground">{p.name}</span>
          <span className="text-[11px] leading-snug text-muted">{p.description}</span>
        </button>
      ))}
      {homeLinks && homeLinks.length > 0 ? (
        <div className="mt-1 border-t border-border pt-1">
          <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-muted">
            Specialized tools
          </p>
          {homeLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              role="menuitem"
              className="flex min-h-11 items-center rounded-lg px-2 text-sm font-semibold text-accent hover:bg-surface-2"
              onClick={() => setOpenMenu(null)}
            >
              {l.label} →
            </Link>
          ))}
        </div>
      ) : null}
    </>
  );

  const addImageMenuBody = (
    <>
      {onAddBackgroundImage ? (
        <button
          type="button"
          role="menuitem"
          className="flex min-h-11 w-full items-center rounded-lg px-2 text-left text-sm font-semibold hover:bg-surface-2"
          onClick={() => {
            setOpenMenu(null);
            window.setTimeout(() => bgRef.current?.click(), 0);
          }}
        >
          Add background image
        </button>
      ) : null}
      {onAddCenterImage ? (
        <button
          type="button"
          role="menuitem"
          className="flex min-h-11 w-full items-center rounded-lg px-2 text-left text-sm font-semibold hover:bg-surface-2"
          onClick={() => {
            setOpenMenu(null);
            window.setTimeout(() => centerRef.current?.click(), 0);
          }}
        >
          Add center image
        </button>
      ) : null}
      {onAddEntryImage ? (
        <button
          type="button"
          role="menuitem"
          className="flex min-h-11 w-full items-center rounded-lg px-2 text-left text-sm font-semibold hover:bg-surface-2"
          onClick={() => {
            setOpenMenu(null);
            window.setTimeout(() => entryRef.current?.click(), 0);
          }}
        >
          Add image as entry
        </button>
      ) : null}
      {hasBackgroundImage && onRemoveBackgroundImage ? (
        <button
          type="button"
          role="menuitem"
          className="flex min-h-11 w-full items-center rounded-lg px-2 text-left text-sm font-semibold text-rose-300 hover:bg-surface-2"
          onClick={() => runAndClose(onRemoveBackgroundImage)}
        >
          Remove background image
        </button>
      ) : null}
      {hasCenterImage && onRemoveCenterImage ? (
        <button
          type="button"
          role="menuitem"
          className="flex min-h-11 w-full items-center rounded-lg px-2 text-left text-sm font-semibold text-rose-300 hover:bg-surface-2"
          onClick={() => runAndClose(onRemoveCenterImage)}
        >
          Remove center image
        </button>
      ) : null}
    </>
  );

  const menuPortal =
    portalRoot && openMenu && menuPos
      ? createPortal(
          <div
            ref={menuRef}
            id={
              openMenu === "open"
                ? openId
                : openMenu === "examples"
                  ? examplesId
                  : openMenu === "add-image"
                    ? addImageId
                    : moreId
            }
            role="menu"
            className="fixed z-[300] max-w-[calc(100vw-16px)] overflow-y-auto overscroll-contain rounded-xl border border-border bg-surface p-1.5 shadow-2xl"
            style={{
              left: menuPos.left,
              width: menuPos.width,
              maxHeight: menuPos.maxHeight,
              ...(menuPos.placement === "above"
                ? { bottom: menuPos.bottom, top: "auto" }
                : { top: menuPos.top, bottom: "auto" }),
            }}
          >
            {openMenu === "open" ? (
              <>
                <button
                  type="button"
                  role="menuitem"
                  className="flex min-h-11 w-full items-center rounded-lg px-2 text-left text-sm font-semibold hover:bg-surface-2"
                  onClick={triggerOpenFile}
                >
                  Open JSON file…
                </button>
                {recent.length > 0 ? (
                  <>
                    <p className="mt-2 px-2 text-[10px] font-bold uppercase tracking-wide text-muted">
                      Recently saved
                    </p>
                    <ul className="mt-1 max-h-48 overflow-y-auto">
                      {recent.map((r) => (
                        <li key={r.savedAt} className="flex items-stretch gap-0.5">
                          <button
                            type="button"
                            role="menuitem"
                            className="flex min-h-11 min-w-0 flex-1 flex-col rounded-lg px-2 py-1 text-left hover:bg-surface-2"
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
                          {onDeleteRecent ? (
                            <button
                              type="button"
                              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-rose-950/40 hover:text-rose-300"
                              aria-label={`Delete ${r.title || "saved wheel"}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteRecent(r.savedAt);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden />
                            </button>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="mt-2 px-2 text-xs text-muted">No recent wheels yet.</p>
                )}
              </>
            ) : openMenu === "examples" ? (
              examplesMenuBody
            ) : openMenu === "add-image" ? (
              addImageMenuBody
            ) : (
              <>
                <Link
                  href="/wheel-gallery"
                  role="menuitem"
                  className="flex min-h-11 items-center rounded-lg px-2 text-sm font-semibold hover:bg-surface-2 sm:hidden"
                  onClick={() => setOpenMenu(null)}
                >
                  Gallery
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  className="flex min-h-11 w-full items-center rounded-lg px-2 text-left text-sm font-semibold hover:bg-surface-2 sm:hidden"
                  onClick={() => runAndClose(onAddWheel)}
                >
                  Add wheel
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="flex min-h-11 w-full items-center rounded-lg px-2 text-left text-sm font-semibold hover:bg-surface-2 sm:hidden"
                  onClick={() => setOpenMenu("examples")}
                >
                  Examples
                  <ChevronDown className="ml-auto h-3.5 w-3.5 opacity-70" aria-hidden />
                </button>

                <p className="mt-2 px-2 text-[10px] font-bold uppercase tracking-wide text-muted sm:hidden">
                  Entries tools
                </p>
                {showAutoRemove ? (
                  <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-2 text-sm font-semibold hover:bg-surface-2 sm:hidden">
                    <input
                      type="checkbox"
                      checked={autoRemove}
                      onChange={(e) => onAutoRemove(e.target.checked)}
                      className="h-4 w-4 accent-cyan-500"
                    />
                    Remove winner after spin
                  </label>
                ) : null}
                <button
                  type="button"
                  role="menuitem"
                  className="flex min-h-11 w-full items-center rounded-lg px-2 text-left text-sm font-semibold hover:bg-surface-2 sm:hidden"
                  onClick={() => runAndClose(onShuffle)}
                >
                  Shuffle
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="flex min-h-11 w-full items-center rounded-lg px-2 text-left text-sm font-semibold hover:bg-surface-2 sm:hidden"
                  onClick={() => runAndClose(onSort)}
                >
                  Sort
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="flex min-h-11 w-full items-center rounded-lg px-2 text-left text-sm font-semibold hover:bg-surface-2 sm:hidden"
                  onClick={() => setOpenMenu("add-image")}
                >
                  Add image
                  <ChevronDown className="ml-auto h-3.5 w-3.5 opacity-70" aria-hidden />
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="flex min-h-11 w-full items-center rounded-lg px-2 text-left text-sm font-semibold hover:bg-surface-2 sm:hidden"
                  onClick={() => runAndClose(() => void onCopy())}
                >
                  Copy
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="flex min-h-11 w-full items-center rounded-lg px-2 text-left text-sm font-semibold hover:bg-surface-2 sm:hidden"
                  onClick={() => runAndClose(onRestoreDefaults)}
                >
                  Defaults
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="flex min-h-11 w-full items-center rounded-lg px-2 text-left text-sm font-semibold text-rose-300 hover:bg-surface-2 sm:hidden"
                  onClick={() => runAndClose(onClear)}
                >
                  Clear
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="flex min-h-11 w-full items-center rounded-lg px-2 text-left text-sm font-semibold hover:bg-surface-2 sm:hidden"
                  onClick={() => runAndClose(onOpenAdvanced)}
                >
                  Advanced…
                </button>

                <a
                  href="mailto:hello@exestools.com?subject=Spinner%20wheel%20feedback"
                  role="menuitem"
                  className="flex min-h-11 items-center rounded-lg px-2 text-sm font-semibold hover:bg-surface-2"
                  onClick={() => setOpenMenu(null)}
                >
                  Feedback
                </a>
                <a
                  href={faqHref}
                  role="menuitem"
                  className="flex min-h-11 items-center rounded-lg px-2 text-sm font-semibold hover:bg-surface-2"
                  onClick={() => setOpenMenu(null)}
                >
                  FAQ
                </a>
                <button
                  type="button"
                  role="menuitem"
                  className="flex min-h-11 w-full items-center rounded-lg px-2 text-left text-sm font-semibold hover:bg-surface-2"
                  onClick={() => {
                    setOpenMenu(null);
                    setCsvError("");
                    setCsvOpen(true);
                  }}
                >
                  Import from pasted CSV
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="flex min-h-11 w-full items-center rounded-lg px-2 text-left text-sm font-semibold hover:bg-surface-2"
                  onClick={() => {
                    setOpenMenu(null);
                    onPreferences();
                  }}
                >
                  Customize
                </button>
              </>
            )}
          </div>,
          portalRoot,
        )
      : null;

  return (
    <div className="relative w-full min-w-0 max-w-full space-y-1">
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
      <input
        ref={bgRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f && onAddBackgroundImage) onAddBackgroundImage(f);
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
          if (f && onAddCenterImage) onAddCenterImage(f);
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
          if (f && onAddEntryImage) onAddEntryImage(f);
          e.target.value = "";
        }}
      />

      {/* Row 1 — primary actions; no wrap on ≥sm */}
      <div className="flex w-full min-w-0 max-w-full flex-wrap items-center gap-1 rounded-2xl border border-border bg-surface px-1 py-1 sm:flex-nowrap sm:gap-1 sm:overflow-x-auto sm:px-2">
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
        <BarBtn
          disabled={disabled}
          onClick={() => {
            setSaveTitle(defaultSaveTitle || "My wheel");
            setSaveDownload(false);
            setSaveError("");
            setSaveOpen(true);
          }}
        >
          Save
        </BarBtn>
        <BarBtn disabled={disabled} onClick={onShare}>
          Share
        </BarBtn>
        <Link
          href="/wheel-gallery"
          className="hidden min-h-11 shrink-0 items-center rounded-lg px-2.5 text-xs font-bold text-foreground outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent sm:inline-flex"
        >
          Gallery
        </Link>
        <BarBtn
          disabled={disabled}
          className="max-sm:hidden"
          onClick={() => {
            setOpenMenu(null);
            onAddWheel();
          }}
        >
          Add wheel
        </BarBtn>
        <BarBtn
          ref={examplesBtnRef}
          disabled={disabled}
          className="max-sm:hidden"
          onClick={() => setOpenMenu((m) => (m === "examples" ? null : "examples"))}
          aria-expanded={openMenu === "examples"}
          aria-controls={examplesId}
          aria-haspopup="menu"
        >
          Examples
          <ChevronDown className="h-3.5 w-3.5 opacity-70" aria-hidden />
        </BarBtn>
        {!isFullscreen ? (
          <button
            type="button"
            disabled={disabled}
            onClick={onFullscreen}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-foreground outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
            aria-label="Fullscreen"
            title="Fullscreen"
          >
            <Maximize2 className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
        <BarBtn
          ref={moreBtnRef}
          disabled={disabled}
          className="sm:ml-auto"
          onClick={() => setOpenMenu((m) => (m === "more" ? null : "more"))}
          aria-expanded={openMenu === "more"}
          aria-controls={moreId}
          aria-haspopup="menu"
        >
          More
          <ChevronDown className="h-3.5 w-3.5 opacity-70" aria-hidden />
        </BarBtn>
      </div>

      {/* Row 2 — entries tools (desktop only) */}
      <div
        className="hidden w-full min-w-0 max-w-full items-center gap-1 overflow-x-auto rounded-2xl border border-border bg-surface px-1 py-1 sm:flex sm:flex-nowrap sm:gap-1.5 sm:px-2"
        aria-label="Entries tools"
      >
        {showAutoRemove ? (
          <label className="inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-lg px-2 text-xs font-bold text-foreground hover:bg-surface-2">
            <input
              type="checkbox"
              checked={autoRemove}
              onChange={(e) => onAutoRemove(e.target.checked)}
              disabled={disabled}
              className="h-4 w-4 accent-cyan-500 disabled:opacity-50"
            />
            Remove winner after spin
          </label>
        ) : null}
        <BarBtn
          disabled={disabled}
          onClick={onShuffle}
          icon={<Shuffle className="h-3.5 w-3.5" />}
        >
          Shuffle
        </BarBtn>
        <BarBtn
          disabled={disabled}
          onClick={onSort}
          icon={<ArrowUpDown className="h-3.5 w-3.5" />}
        >
          Sort
        </BarBtn>
        <BarBtn
          ref={addImageBtnRef}
          disabled={disabled}
          onClick={() => setOpenMenu((m) => (m === "add-image" ? null : "add-image"))}
          aria-expanded={openMenu === "add-image"}
          aria-controls={addImageId}
          aria-haspopup="menu"
        >
          Add image
          <ChevronDown className="h-3.5 w-3.5 opacity-70" aria-hidden />
        </BarBtn>
        <BarBtn
          disabled={disabled}
          onClick={() => void onCopy()}
          icon={<ClipboardCopy className="h-3.5 w-3.5" />}
        >
          Copy
        </BarBtn>
        <BarBtn
          disabled={disabled}
          onClick={onRestoreDefaults}
          icon={<RotateCcw className="h-3.5 w-3.5" />}
        >
          Defaults
        </BarBtn>
        <BarBtn
          disabled={disabled}
          onClick={onClear}
          icon={<Eraser className="h-3.5 w-3.5" />}
          className="text-rose-300 hover:bg-rose-950/40"
        >
          Clear
        </BarBtn>
        <BarBtn disabled={disabled} onClick={onOpenAdvanced}>
          Advanced…
        </BarBtn>
      </div>

      {menuPortal}

      {shareUrl ? (
        <div className="absolute left-0 right-0 top-full z-[60] mt-1 flex w-full min-w-0 flex-col gap-2 rounded-xl border border-border bg-surface p-3 pb-[calc(0.75rem+4.5rem)] shadow-xl sm:flex-row sm:items-center sm:pb-3 lg:pb-3">
          <input
            readOnly
            value={shareUrl}
            className="min-h-11 min-w-0 flex-1 truncate rounded-lg border border-border bg-surface-2 px-3 text-xs text-foreground"
            onFocus={(e) => e.currentTarget.select()}
          />
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-accent-strong px-3 text-xs font-bold text-slate-950"
            onClick={() => void navigator.clipboard.writeText(shareUrl)}
          >
            Copy link
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-3 text-xs font-bold"
            onClick={onClearShare}
          >
            Close
          </button>
        </div>
      ) : null}

      {portalRoot && csvOpen
        ? createPortal(
            <div
              className="fixed inset-0 z-[320] flex items-center justify-center bg-black/70 p-4"
              role="dialog"
              aria-modal="true"
              aria-label="Import from pasted CSV"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setCsvOpen(false);
                  setCsvText("");
                  setCsvError("");
                }
              }}
            >
              <div className="w-full max-w-[min(28rem,calc(100vw-2rem))] rounded-2xl border border-border bg-surface p-4 shadow-2xl">
                <h3 className="text-sm font-extrabold">Import from pasted CSV</h3>
                <p className="mt-1 text-xs text-muted">
                  One name per line, or comma-separated values. Use quotes for commas inside a
                  name.
                </p>
                <textarea
                  value={csvText}
                  onChange={(e) => {
                    setCsvText(e.target.value);
                    setCsvError("");
                  }}
                  rows={6}
                  className="mt-3 w-full rounded-xl border border-border bg-surface-2 p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  placeholder={'Alex, Jordan, Sam\nor: a,b,"d, e"'}
                />
                {csvError ? (
                  <p className="mt-2 text-xs font-semibold text-rose-300" role="alert">
                    {csvError}
                  </p>
                ) : null}
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    className="min-h-11 rounded-lg border border-border px-3 text-sm font-bold"
                    onClick={() => {
                      setCsvOpen(false);
                      setCsvText("");
                      setCsvError("");
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="min-h-11 rounded-lg bg-accent-strong px-3 text-sm font-bold text-slate-950"
                    onClick={() => {
                      const parts = parseCsvEntries(csvText);
                      if (parts.length < 2) {
                        setCsvError("Need at least 2 entries to import.");
                        return;
                      }
                      const ok = onImportCsv(csvText);
                      if (ok) {
                        setCsvOpen(false);
                        setCsvText("");
                        setCsvError("");
                      } else {
                        setCsvError("Need at least 2 entries to import.");
                      }
                    }}
                  >
                    Import
                  </button>
                </div>
              </div>
            </div>,
            portalRoot,
          )
        : null}

      {portalRoot && saveOpen
        ? createPortal(
            <div
              className="fixed inset-0 z-[320] flex items-center justify-center bg-black/70 p-4"
              role="dialog"
              aria-modal="true"
              aria-label="Save wheel"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setSaveOpen(false);
                  setSaveError("");
                }
              }}
            >
              <form
                className="w-full max-w-sm rounded-2xl border border-border bg-surface p-4 shadow-2xl"
                onSubmit={(e) => {
                  e.preventDefault();
                  commitSave();
                }}
              >
                <h3 className="text-sm font-extrabold">Save wheel</h3>
                <label className="mt-3 block text-xs font-bold text-muted" htmlFor="et-save-title">
                  Name
                </label>
                <input
                  ref={saveTitleRef}
                  id="et-save-title"
                  value={saveTitle}
                  onChange={(e) => {
                    setSaveTitle(e.target.value);
                    setSaveError("");
                  }}
                  className="mt-1 min-h-11 w-full rounded-xl border border-border bg-surface-2 px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  maxLength={80}
                  autoComplete="off"
                />
                {saveError ? (
                  <p className="mt-2 text-xs font-semibold text-rose-300" role="alert">
                    {saveError}
                  </p>
                ) : null}
                <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={saveDownload}
                    onChange={(e) => setSaveDownload(e.target.checked)}
                    className="h-4 w-4 rounded border-border"
                  />
                  Also download JSON file
                </label>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    className="min-h-11 rounded-lg border border-border px-3 text-sm font-bold"
                    onClick={() => {
                      setSaveOpen(false);
                      setSaveError("");
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="min-h-11 rounded-lg bg-accent-strong px-3 text-sm font-bold text-slate-950"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>,
            portalRoot,
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
    className={`inline-flex min-h-11 shrink-0 items-center gap-1 rounded-lg px-2.5 text-xs font-bold text-foreground outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 ${className}`}
    {...rest}
  >
    {icon}
    {children}
  </button>
);
