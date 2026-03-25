"use client";

import { useCallback, useMemo, useState } from "react";
import {
  LuCopy,
  LuCopyCheck,
  LuFoldHorizontal,
  LuLetterText,
  LuMessageSquareQuote,
  LuRows3,
  LuTrash2,
  LuWholeWord,
} from "react-icons/lu";
import type { StatKey, StatsToolUi } from "@/lib/content/textToolPageTypes";
import { computeTextStats } from "@/lib/countTextStats";
import type { IconType } from "react-icons";

const STAT_ICONS: Record<StatKey, IconType> = {
  words: LuWholeWord,
  characters: LuLetterText,
  charactersNoSpaces: LuFoldHorizontal,
  sentences: LuMessageSquareQuote,
  paragraphs: LuRows3,
};

const DEFAULT_ORDER: StatKey[] = [
  "words",
  "characters",
  "charactersNoSpaces",
  "sentences",
  "paragraphs",
];

type Props = {
  ui: StatsToolUi;
  inputLabel?: string;
};

function statValue(
  key: StatKey,
  stats: ReturnType<typeof computeTextStats>,
): number {
  switch (key) {
    case "words":
      return stats.words;
    case "characters":
      return stats.charactersWithSpaces;
    case "charactersNoSpaces":
      return stats.charactersWithoutSpaces;
    case "sentences":
      return stats.sentences;
    case "paragraphs":
      return stats.paragraphs;
    default:
      return 0;
  }
}

export function TextStatsToolClient({
  ui,
  inputLabel = "Your text",
}: Props) {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => computeTextStats(text), [text]);
  const order = ui.statOrder ?? DEFAULT_ORDER;

  const handleCopy = useCallback(async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [text]);

  const handleClear = useCallback(() => {
    setText("");
    setCopied(false);
  }, []);

  const statItems = order.map((key) => ({
    key,
    label: ui.stats[key],
    value: statValue(key, stats),
    Icon: STAT_ICONS[key],
  }));

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-10">
      <div className="flex min-w-0 flex-1 flex-col gap-4 lg:min-h-0">
        <label
          htmlFor="stats-tool-textarea"
          className="text-sm font-semibold text-secondary-text"
        >
          {inputLabel}
        </label>
        <p className="text-xs text-secondary-text/75">
          Live counts update while you type. Great for writing limits and quick
          checks.
        </p>
        <div className="relative flex min-h-[min(22rem,50vh)] flex-1 flex-col overflow-hidden rounded-xl border border-input-border/90 bg-background shadow-inner ring-1 ring-black/3 transition-shadow focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 lg:min-h-0">
          <textarea
            id="stats-tool-textarea"
            className="input min-h-[min(22rem,50vh)] w-full flex-1 resize-y border-0 bg-transparent p-4 text-sm shadow-none ring-0 focus:border-transparent focus:outline-none focus:ring-0 md:min-h-[280px] md:p-5 md:text-base lg:min-h-0"
            placeholder={ui.textareaPlaceholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck
            aria-label={ui.textareaPlaceholder}
          />
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-linear-to-t from-background/90 to-transparent"
            aria-hidden
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="btn gap-2 px-5 disabled:pointer-events-none disabled:opacity-45"
            onClick={handleCopy}
            disabled={!text}
          >
            {copied ? (
              <>
                <LuCopyCheck className="h-5 w-5" aria-hidden />
                {ui.copySuccess}
              </>
            ) : (
              <>
                <LuCopy className="h-5 w-5" aria-hidden />
                {ui.copyButton}
              </>
            )}
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-input-border bg-background px-5 py-2 text-base font-medium leading-relaxed text-secondary-text transition-all duration-200 hover:border-primary/40 hover:bg-surface hover:text-primary"
            onClick={handleClear}
          >
            <LuTrash2 className="h-5 w-5" aria-hidden />
            {ui.clearButton}
          </button>
        </div>
      </div>

      <aside className="w-full shrink-0 lg:w-[min(100%,340px)] lg:self-start xl:w-[380px]">
        <div className="sticky top-24 space-y-3 rounded-2xl border border-input-border/80 bg-linear-to-b from-surface/90 to-background p-4 shadow-lg shadow-black/4 ring-1 ring-black/3 md:p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary/90">
            {ui.liveCountsHeading}
          </p>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2 lg:grid-cols-1 lg:gap-2">
            {statItems.map((item) => {
              const Icon = item.Icon;
              return (
                <li key={item.key}>
                  <div className="group flex items-center gap-3 rounded-xl border border-input-border/70 bg-background/90 px-3 py-3 transition-all duration-200 hover:border-primary/25 hover:shadow-md md:px-4 md:py-3.5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary/15 to-primary/5 text-primary transition-transform duration-200 group-hover:scale-105">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.6875rem] font-medium uppercase tracking-wide text-secondary-text/70 md:text-xs">
                        {item.label}
                      </p>
                      <p className="text-xl font-bold tabular-nums tracking-tight text-secondary-text md:text-2xl">
                        {item.value.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
    </div>
  );
}
