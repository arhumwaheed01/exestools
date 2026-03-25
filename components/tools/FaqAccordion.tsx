"use client";

import { useId, useState } from "react";
import { LuChevronDown } from "react-icons/lu";

export type FaqItem = {
  question: string;
  answer: string;
};

type Props = {
  heading: string;
  items: FaqItem[];
};

export function FaqAccordion({ heading, items }: Props) {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="w-full">
      <h2 className="mt-0! text-center text-2xl font-semibold tracking-tight text-secondary-text md:text-3xl">
        {heading}
      </h2>
      <div
        className="mt-8 overflow-hidden rounded-2xl border border-input-border/80 bg-linear-to-b from-background to-surface shadow-sm ring-1 ring-black/3"
        role="region"
        aria-label={heading}
      >
        <ul className="divide-y divide-input-border/70">
          {items.map((item, i) => {
            const isOpen = openIndex === i;
            const panelId = `${baseId}-panel-${i}`;
            const headerId = `${baseId}-header-${i}`;

            return (
              <li key={i}>
                <h3 className="mt-0! text-base font-semibold md:text-lg">
                  <button
                    type="button"
                    id={headerId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-secondary-text transition-colors hover:bg-primary/4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 md:px-6 md:py-5"
                    onClick={() =>
                      setOpenIndex((prev) => (prev === i ? null : i))
                    }
                  >
                    <span className="pr-2 leading-snug">{item.question}</span>
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 ease-out ${
                        isOpen ? "rotate-180" : "rotate-0"
                      }`}
                      aria-hidden
                    >
                      <LuChevronDown className="h-5 w-5" />
                    </span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={headerId}
                  className="grid transition-[grid-template-rows] duration-300 ease-out"
                  style={{
                    gridTemplateRows: isOpen ? "1fr" : "0fr",
                  }}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="border-t border-input-border/40 bg-primary/2 px-5 pb-5 pt-0 md:px-6 md:pb-6">
                      <p className="pt-4 text-left text-base leading-relaxed text-secondary-text/95">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
