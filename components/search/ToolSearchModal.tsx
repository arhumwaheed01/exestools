"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { createPortal } from "react-dom";
import { LuClock, LuSearch, LuSparkles, LuX } from "react-icons/lu";
import { homepageData } from "@/lib/content/homepageData";
import {
  searchableTools,
  searchableToolsBySlug,
  type SearchableTool,
} from "@/lib/content/searchIndex";
import {
  highlightParts,
  normalizeQuery,
  relatedByQueryTokens,
  searchTools,
} from "@/lib/search/matchTools";
import { toolPath } from "@/lib/content/textToolsData";

const DEBOUNCE_MS = 300;
const RESULT_LIMIT = 10;
const RELATED_LIMIT = 8;
const RECENT_KEY = "exestools-search-recent";
const MAX_RECENT = 5;

function readRecentSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

function pushRecentSlug(slug: string) {
  try {
    const prev = readRecentSlugs().filter((s) => s !== slug);
    const next = [slug, ...prev].slice(0, MAX_RECENT);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

function HighlightText({
  text,
  query,
  className,
}: {
  text: string;
  query: string;
  className?: string;
}) {
  const parts = highlightParts(text, query);
  return (
    <span className={className}>
      {parts.map((p, i) =>
        p.match ? (
          <mark
            key={i}
            className="rounded bg-primary/20 px-0.5 font-semibold text-primary"
          >
            {p.text}
          </mark>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </span>
  );
}

function ResultRow({
  tool,
  query,
  active,
  id,
  onNavigate,
  className,
}: {
  tool: SearchableTool;
  query: string;
  active: boolean;
  id: string;
  /** Record visit + close modal; Link performs client navigation. */
  onNavigate: () => void;
  className?: string;
}) {
  return (
    <li role="none">
      <Link
        id={id}
        href={toolPath(tool.slug)}
        role="option"
        aria-selected={active}
        onClick={onNavigate}
        className={`flex flex-col gap-0.5 rounded-xl border px-4 py-3 text-left no-underline transition-all duration-200 ${
          active
            ? "border-primary/50 bg-primary/8 shadow-sm ring-2 ring-primary/25"
            : "border-transparent bg-surface/80 hover:border-primary/25 hover:bg-primary/5"
        } ${className ?? ""}`}
      >
        <span className="font-semibold text-secondary-text">
          <HighlightText text={tool.name} query={query} />
        </span>
        <span className="line-clamp-2 text-sm leading-snug text-secondary-text/85">
          <HighlightText text={tool.description} query={query} />
        </span>
      </Link>
    </li>
  );
}

export type ToolSearchModalProps = {
  open: boolean;
  onClose: () => void;
};

export function ToolSearchModal({ open, onClose }: ToolSearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const baseId = useId();
  const listId = `${baseId}-listbox`;

  const [inputValue, setInputValue] = useState("");
  const debouncedQuery = useDebouncedValue(inputValue, DEBOUNCE_MS);
  const [activeIndex, setActiveIndex] = useState(0);
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (open) {
      setRecentSlugs(readRecentSlugs());
      const t = window.requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
      return () => window.cancelAnimationFrame(t);
    }
    setInputValue("");
    setActiveIndex(0);
  }, [open]);

  const popularTools = useMemo(() => {
    return homepageData.popularTools
      .map((p) => searchableToolsBySlug.get(p.slug))
      .filter((t): t is SearchableTool => Boolean(t));
  }, []);

  const recentTools = useMemo(() => {
    return recentSlugs
      .map((s) => searchableToolsBySlug.get(s))
      .filter((t): t is SearchableTool => Boolean(t));
  }, [recentSlugs]);

  const results = useMemo(() => {
    return searchTools(debouncedQuery, searchableTools, RESULT_LIMIT);
  }, [debouncedQuery]);

  const noExactMatch = normalizeQuery(debouncedQuery).length > 0 && results.length === 0;

  const relatedTools = useMemo(() => {
    if (!noExactMatch) return [];
    const exclude = new Set<string>();
    return relatedByQueryTokens(
      debouncedQuery,
      searchableTools,
      exclude,
      RELATED_LIMIT,
    );
  }, [debouncedQuery, noExactMatch]);

  const popularFiltered = useMemo(() => {
    if (!noExactMatch) return [];
    const relSlugs = new Set(relatedTools.map((t) => t.slug));
    return popularTools.filter((t) => !relSlugs.has(t.slug));
  }, [noExactMatch, relatedTools, popularTools]);

  const flatNavigable = useMemo(() => {
    const q = normalizeQuery(debouncedQuery);
    if (q.length === 0) return [];
    if (results.length > 0) return results;
    return [...relatedTools, ...popularFiltered];
  }, [debouncedQuery, results, relatedTools, popularFiltered]);

  const hasTyped = normalizeQuery(inputValue).length > 0;
  const pendingDebounce =
    hasTyped && inputValue.trim() !== debouncedQuery.trim();

  useEffect(() => {
    setActiveIndex(0);
  }, [debouncedQuery]);

  useEffect(() => {
    if (flatNavigable.length === 0) return;
    setActiveIndex((i) => Math.min(i, flatNavigable.length - 1));
  }, [flatNavigable.length]);

  const recordVisitAndClose = useCallback(
    (slug: string) => {
      pushRecentSlug(slug);
      onClose();
    },
    [onClose],
  );

  const goToSlug = useCallback(
    (slug: string) => {
      pushRecentSlug(slug);
      onClose();
      router.push(toolPath(slug));
    },
    [onClose, router],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (pendingDebounce) return;
      if (flatNavigable.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(flatNavigable.length - 1, i + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(0, i - 1));
      } else if (e.key === "Enter") {
        const tool = flatNavigable[activeIndex] ?? flatNavigable[0];
        if (tool) {
          e.preventDefault();
          goToSlug(tool.slug);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, pendingDebounce, flatNavigable, activeIndex, goToSlug, onClose]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, onClose]);

  if (!mounted || !open) return null;

  const showDefault = !hasTyped;
  const inputId = `${baseId}-input`;

  const modal = (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-x-hidden overflow-y-hidden bg-black/45 px-3 py-6 pt-[max(1.5rem,6vh)] backdrop-blur-[2px] sm:px-4 sm:py-8 sm:pt-[min(10vh,5rem)]"
      role="presentation"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${baseId}-title`}
        className="animate-fade-in-up flex max-h-[calc(100dvh-3rem)] w-full max-w-[min(42rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-input-border bg-background shadow-2xl shadow-black/15 ring-1 ring-black/5"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-input-border/80 px-4 py-3 sm:px-5">
          <h2 id={`${baseId}-title`} className="text-lg font-bold text-secondary-text">
            Search tools
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-input-border text-secondary-text transition-colors hover:border-primary/40 hover:text-primary"
            aria-label="Close search"
          >
            <LuX className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col p-4 sm:p-5">
          <label htmlFor={inputId} className="sr-only">
            Search tools by name or keyword
          </label>
          <div className="relative shrink-0">
            <LuSearch
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-secondary-text/50"
              aria-hidden
            />
            <input
              ref={inputRef}
              id={inputId}
              type="search"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search by tool name, slug, or keyword…"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              aria-controls={listId}
              aria-activedescendant={
                flatNavigable.length > 0
                  ? `${baseId}-opt-${activeIndex}`
                  : undefined
              }
              aria-expanded={showDefault ? false : flatNavigable.length > 0}
              className="w-full rounded-2xl border border-input-border bg-surface py-3.5 pl-12 pr-4 text-base text-secondary-text shadow-inner outline-none ring-primary/30 transition-shadow placeholder:text-secondary-text/45 focus:border-primary/40 focus:ring-4"
            />
          </div>

          <div className="mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
            {pendingDebounce ? (
              <p className="py-6 text-center text-sm text-secondary-text/70">
                Searching…
              </p>
            ) : null}

            {showDefault ? (
              <div className="space-y-6">
                {recentTools.length > 0 ? (
                  <section aria-label="Recent tools">
                    <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-secondary-text/70">
                      <LuClock className="h-3.5 w-3.5" aria-hidden />
                      Recent
                    </p>
                    <ul className="grid gap-2">
                      {recentTools.map((tool) => (
                        <li key={tool.slug}>
                          <Link
                            href={toolPath(tool.slug)}
                            onClick={() => {
                              pushRecentSlug(tool.slug);
                              onClose();
                            }}
                            className="block rounded-xl border border-input-border/80 bg-surface/60 px-4 py-2.5 text-sm font-medium text-primary no-underline transition-colors hover:border-primary/30 hover:bg-primary/5"
                          >
                            {tool.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                <section aria-label="Popular tools">
                  <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-secondary-text/70">
                    <LuSparkles className="h-3.5 w-3.5" aria-hidden />
                    Popular tools
                  </p>
                  <ul className="grid gap-2">
                    {popularTools.map((tool) => (
                      <li key={tool.slug}>
                        <Link
                          href={toolPath(tool.slug)}
                          onClick={() => {
                            pushRecentSlug(tool.slug);
                            onClose();
                          }}
                          className="block rounded-xl border border-input-border/80 bg-surface/60 px-4 py-2.5 text-sm font-medium text-primary no-underline transition-colors hover:border-primary/30 hover:bg-primary/5"
                        >
                          {tool.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            ) : null}

            {!showDefault && !pendingDebounce && results.length > 0 ? (
              <ul id={listId} role="listbox" aria-label="Search results" className="grid gap-2">
                {results.map((tool, i) => (
                  <ResultRow
                    key={tool.slug}
                    tool={tool}
                    query={debouncedQuery}
                    active={i === activeIndex}
                    id={`${baseId}-opt-${i}`}
                    onNavigate={() => recordVisitAndClose(tool.slug)}
                  />
                ))}
              </ul>
            ) : null}

            {!showDefault && !pendingDebounce && results.length === 0 ? (
              <div className="space-y-5">
                <p className="text-center text-sm font-medium text-secondary-text/90">
                  No exact match found. Try these tools instead:
                </p>

                {relatedTools.length > 0 || popularFiltered.length > 0 ? (
                  <ul id={listId} role="listbox" aria-label="Suggested tools" className="grid gap-2">
                    {relatedTools.map((tool, i) => (
                      <ResultRow
                        key={tool.slug}
                        tool={tool}
                        query={debouncedQuery}
                        active={i === activeIndex}
                        id={`${baseId}-opt-${i}`}
                        onNavigate={() => recordVisitAndClose(tool.slug)}
                      />
                    ))}
                    {popularFiltered.map((tool, j) => {
                      const idx = relatedTools.length + j;
                      return (
                        <ResultRow
                          key={tool.slug}
                          tool={tool}
                          query=""
                          active={idx === activeIndex}
                          id={`${baseId}-opt-${idx}`}
                          onNavigate={() => recordVisitAndClose(tool.slug)}
                          className={
                            j === 0 && relatedTools.length > 0
                              ? "mt-4 border-t border-input-border/70 pt-4"
                              : undefined
                          }
                        />
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-center text-sm text-secondary-text/70">
                    No suggestions available.
                  </p>
                )}
              </div>
            ) : null}
          </div>

          <p className="mt-4 shrink-0 border-t border-input-border/60 pt-3 text-center text-xs text-secondary-text/60">
            <kbd className="rounded border border-input-border bg-surface px-1.5 py-0.5 font-mono text-[0.7rem]">
              ↑
            </kbd>{" "}
            <kbd className="rounded border border-input-border bg-surface px-1.5 py-0.5 font-mono text-[0.7rem]">
              ↓
            </kbd>{" "}
            to move ·{" "}
            <kbd className="rounded border border-input-border bg-surface px-1.5 py-0.5 font-mono text-[0.7rem]">
              Enter
            </kbd>{" "}
            to open ·{" "}
            <kbd className="rounded border border-input-border bg-surface px-1.5 py-0.5 font-mono text-[0.7rem]">
              Esc
            </kbd>{" "}
            to close
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
