"use client";

import { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { RefreshCw, Trophy } from "lucide-react";
import { fireCelebrationConfetti } from "@/components/tools/Confetti";

type Props = {
  open: boolean;
  winner: string | null;
  entryCount?: number;
  /** When true, odds were weighted — don't say "fairly". */
  weighted?: boolean;
  showRemoveContinue?: boolean;
  titleBarText?: string;
  /** Dismiss without opening next steps (Escape / backdrop). */
  onDismiss: () => void;
  onSpinAgain: () => void;
  onRemoveWinner: () => void;
};

export function WinnerModal({
  open,
  winner,
  entryCount,
  weighted = false,
  showRemoveContinue = true,
  titleBarText = "We have a winner!",
  onDismiss,
  onSpinAgain,
  onRemoveWinner,
}: Props) {
  const titleId = useId();
  const primaryRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();
  const firedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!open || !winner) {
      firedFor.current = null;
      return;
    }
    if (firedFor.current === winner) return;
    firedFor.current = winner;
    fireCelebrationConfetti();
  }, [open, winner]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => primaryRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onDismiss]);

  const subtitle =
    typeof entryCount === "number" && entryCount > 0
      ? weighted
        ? `Picked by weight from ${entryCount} ${entryCount === 1 ? "entry" : "entries"}.`
        : `Picked fairly from ${entryCount} ${entryCount === 1 ? "entry" : "entries"}.`
      : "Nice pick! Spin again anytime.";

  return (
    <AnimatePresence>
      {open && winner ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden bg-black/70 p-3 backdrop-blur-sm sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onDismiss();
          }}
        >
          <motion.div
            className="relative mx-auto box-border w-full max-w-[min(28rem,calc(100vw-1.5rem))] overflow-hidden rounded-3xl border border-border bg-surface text-center shadow-2xl"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
          >
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-4 py-3.5 sm:px-6 sm:py-4">
              <div className="flex items-center justify-center gap-2 text-white">
                <Trophy className="h-5 w-5 drop-shadow" aria-hidden />
                <p className="text-xs font-bold uppercase tracking-[0.2em] drop-shadow">
                  {titleBarText}
                </p>
              </div>
            </div>

            <div className="px-4 pb-5 pt-4 sm:px-8 sm:pb-8 sm:pt-5">
              <h2
                id={titleId}
                className="break-words text-3xl font-extrabold text-foreground sm:text-4xl"
              >
                {winner}
              </h2>
              <p className="mt-3 text-sm text-muted">{subtitle}</p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                {showRemoveContinue ? (
                  <button
                    type="button"
                    onClick={onRemoveWinner}
                    className="inline-flex min-h-12 min-w-[7.5rem] flex-1 items-center justify-center rounded-xl border border-border bg-surface-2 px-4 text-sm font-bold text-foreground outline-none hover:bg-border focus-visible:ring-2 focus-visible:ring-accent sm:min-w-[8.5rem] sm:flex-none sm:px-5"
                  >
                    Remove
                  </button>
                ) : null}
                <button
                  ref={primaryRef}
                  type="button"
                  onClick={onSpinAgain}
                  className="inline-flex min-h-12 min-w-[7.5rem] flex-1 items-center justify-center gap-1.5 rounded-xl bg-accent-strong px-4 text-sm font-bold text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.35)] outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-accent sm:min-w-[8.5rem] sm:flex-none sm:px-5"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden />
                  Spin again
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
