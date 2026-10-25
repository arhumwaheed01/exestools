"use client";

import { useEffect, useId, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { RefreshCw, Sparkles, X } from "lucide-react";
import type { ToolId } from "@/lib/tools";

const RELATED: Record<ToolId, { href: string; label: string }[]> = {
  home: [
    { href: "/random-name-picker", label: "Random Name Picker" },
    { href: "/classroom-spinner", label: "Classroom spinner" },
    { href: "/prize-wheel", label: "Prize wheel" },
    { href: "/yes-no-wheel", label: "Yes or no wheel" },
    { href: "/random-team-generator", label: "Random Team Generator" },
    { href: "/secret-santa-generator", label: "Secret Santa generator" },
    { href: "/random-number-wheel", label: "Random number wheel" },
    { href: "/raffle-generator", label: "Raffle Generator" },
    { href: "/bingo-card-generator", label: "Bingo card generator" },
  ],
  "random-name-picker": [
    { href: "/classroom-spinner", label: "Classroom / student spinner" },
    { href: "/random-team-generator", label: "Random team generator" },
    { href: "/secret-santa-generator", label: "Secret Santa generator" },
    { href: "/raffle-generator", label: "Raffle generator" },
    { href: "/", label: "Free spinner wheel" },
    { href: "/yes-no-wheel", label: "Yes or no wheel" },
    { href: "/prize-wheel", label: "Prize / giveaway wheel" },
  ],
  "classroom-spinner": [
    { href: "/random-name-picker", label: "Generic name picker" },
    { href: "/random-team-generator", label: "Split the class into groups" },
    { href: "/prize-wheel", label: "Classroom reward / prize wheel" },
    { href: "/", label: "All-purpose spinner wheel" },
    { href: "/yes-no-wheel", label: "Yes or no wheel" },
    { href: "/random-number-wheel", label: "Number wheel for math games" },
    { href: "/bingo-card-generator", label: "Bingo card generator" },
  ],
  "prize-wheel": [
    { href: "/random-name-picker", label: "Pick a winner by name" },
    { href: "/classroom-spinner", label: "Classroom spinner" },
    { href: "/yes-no-wheel", label: "Yes or no wheel" },
    { href: "/raffle-generator", label: "Raffle generator" },
    { href: "/secret-santa-generator", label: "Secret Santa generator" },
    { href: "/", label: "Spinner wheel home" },
  ],
  "yes-no-wheel": [
    { href: "/", label: "Multi-option decision wheel" },
    { href: "/random-name-picker", label: "Random name picker" },
    { href: "/prize-wheel", label: "Prize wheel" },
    { href: "/classroom-spinner", label: "Classroom spinner" },
  ],
  "random-team-generator": [
    { href: "/classroom-spinner", label: "Classroom spinner" },
    { href: "/random-name-picker", label: "Random name picker" },
    { href: "/secret-santa-generator", label: "Secret Santa generator" },
    { href: "/", label: "Spinner wheel" },
  ],
  "secret-santa-generator": [
    { href: "/random-name-picker", label: "Random name picker" },
    { href: "/random-team-generator", label: "Random team generator" },
    { href: "/", label: "Free spinner wheel" },
    { href: "/prize-wheel", label: "Prize wheel" },
  ],
  "random-number-wheel": [
    { href: "/", label: "Spinner wheel" },
    { href: "/classroom-spinner", label: "Classroom spinner" },
    { href: "/prize-wheel", label: "Prize wheel" },
    { href: "/raffle-generator", label: "Raffle generator" },
  ],
  "raffle-generator": [
    { href: "/prize-wheel", label: "Prize wheel" },
    { href: "/random-name-picker", label: "Random name picker" },
    { href: "/random-number-wheel", label: "Random number wheel" },
    { href: "/", label: "Free spinner wheel" },
  ],
  "bingo-card-generator": [
    { href: "/random-number-wheel", label: "Random number wheel" },
    { href: "/classroom-spinner", label: "Classroom spinner" },
    { href: "/raffle-generator", label: "Raffle generator" },
    { href: "/", label: "Free spinner wheel" },
  ],
};

type Props = {
  open: boolean;
  toolId: ToolId;
  onClose: () => void;
  onSpinAgain: () => void;
};

export function NextStepsModal({ open, toolId, onClose, onSpinAgain }: Props) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();
  const links = RELATED[toolId] ?? RELATED.home;

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => closeRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            className="relative mx-auto w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
          >
            <div className="border-b border-border bg-gradient-to-br from-accent/15 via-transparent to-transparent px-5 pb-4 pt-5 sm:px-6">
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-lg text-muted outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3 pr-10">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/20 text-accent">
                  <Sparkles className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <h2 id={titleId} className="text-lg font-extrabold text-foreground sm:text-xl">
                    Next steps
                  </h2>
                  <p className="mt-0.5 text-sm text-muted">
                    Spin again, or try a related spinner.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-5 py-4 sm:px-6">
              <button
                type="button"
                onClick={onSpinAgain}
                className="inline-flex w-full min-h-12 items-center justify-center gap-2 rounded-xl bg-accent-strong px-5 text-sm font-bold text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.28)] outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-accent"
              >
                <RefreshCw className="h-4 w-4" aria-hidden />
                Spin again
              </button>

              <p className="mb-2 mt-5 text-xs font-bold uppercase tracking-wide text-muted">
                Related tools
              </p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {links.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex min-h-11 items-center rounded-xl border border-border bg-surface-2 px-3 text-sm font-semibold text-foreground outline-none transition hover:border-accent hover:bg-background focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-border px-5 py-3 sm:px-6">
              <button
                type="button"
                onClick={onClose}
                className="text-sm font-semibold text-muted underline outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
