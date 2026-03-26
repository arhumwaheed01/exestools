"use client";

import Link from "next/link";
import { useId, useMemo, useRef, useState } from "react";
import { LuSearch } from "react-icons/lu";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { legalSidebarUsefulLinks } from "@/lib/content/legalSidebarData";
import { searchableTools } from "@/lib/content/searchIndex";
import { toolPath } from "@/lib/content/textToolsData";
import { normalizeQuery, searchTools } from "@/lib/search/matchTools";

const DEBOUNCE_MS = 250;
const SUGGESTION_LIMIT = 6;

const cardClass =
  "rounded-xl border border-input-border/85 bg-background/95 p-3.5 shadow-sm shadow-black/[0.04] ring-1 ring-black/[0.025]";

type Props = {
  popularTools: readonly { name: string; slug: string }[];
};

export function LegalSidebar({ popularTools }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const debounced = useDebouncedValue(value, DEBOUNCE_MS);

  const results = useMemo(
    () => searchTools(debounced, searchableTools, SUGGESTION_LIMIT),
    [debounced],
  );

  const showList =
    open && normalizeQuery(debounced).length > 0 && results.length > 0;

  return (
    <aside
      className="flex h-full min-h-0 w-full flex-col space-y-4 lg:sticky lg:top-24 lg:self-start"
      aria-label="Tools and site links"
    >
      <div
        className={cardClass}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setOpen(false);
          }
        }}
      >
        <label
          htmlFor={`${listId}-search`}
          className="mb-1.5 block text-[0.65rem] font-bold uppercase tracking-[0.12em] text-secondary-text/70"
        >
          Search tools
        </label>
        <div className="relative">
          <LuSearch
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-secondary-text/40"
            aria-hidden
          />
          <input
            ref={inputRef}
            id={`${listId}-search`}
            type="search"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setOpen(false);
                inputRef.current?.blur();
              }
            }}
            placeholder="Search tools..."
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            aria-expanded={showList}
            aria-controls={showList ? `${listId}-suggestions` : undefined}
            aria-autocomplete="list"
            role="combobox"
            className="w-full rounded-lg border border-input-border bg-surface py-2 pl-9 pr-2.5 text-xs text-secondary-text outline-none ring-primary/15 placeholder:text-secondary-text/45 focus:border-primary/40 focus:ring-2"
          />
          {showList ? (
            <ul
              id={`${listId}-suggestions`}
              role="listbox"
              className="absolute left-0 right-0 top-[calc(100%+0.375rem)] z-20 max-h-56 overflow-y-auto rounded-xl border border-input-border bg-background py-1 shadow-lg"
            >
              {results.map((tool) => (
                <li key={tool.slug} role="option">
                  <Link
                    href={toolPath(tool.slug)}
                    className="block px-2.5 py-1.5 text-xs font-medium text-primary no-underline transition-colors hover:bg-primary/10"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setValue("");
                      setOpen(false);
                    }}
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <section
        className={cardClass}
        aria-labelledby={`${listId}-popular-heading`}
      >
        <h2
          id={`${listId}-popular-heading`}
          className="!mt-0 border-b border-input-border/65 pb-1.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-secondary-text/70"
        >
          Popular tools
        </h2>
        <ul className="mt-2 flex flex-col gap-0.5">
          {popularTools.map((t) => (
            <li key={t.slug}>
              <Link
                href={toolPath(t.slug)}
                className="block rounded-md px-1.5 py-1.5 text-xs font-semibold text-primary no-underline transition-colors hover:bg-primary/[0.07]"
              >
                {t.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className={cardClass} aria-labelledby={`${listId}-links-heading`}>
        <h2
          id={`${listId}-links-heading`}
          className="!mt-0 border-b border-input-border/65 pb-1.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-secondary-text/70"
        >
          Useful links
        </h2>
        <ul className="mt-2 flex flex-col gap-0.5">
          {legalSidebarUsefulLinks.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block rounded-md px-1.5 py-1.5 text-xs font-semibold text-primary no-underline transition-colors hover:bg-primary/[0.07]"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
