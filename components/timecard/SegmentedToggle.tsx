"use client";

import type { ReactNode } from "react";

type Props = {
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
};

/** Segmented control button with an explicit pressed style (no border-border + border-accent clash). */
export function SegmentedToggle({
  pressed,
  onClick,
  children,
  className = "",
  disabled,
  "aria-label": ariaLabel,
}: Props) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={pressed}
      aria-label={ariaLabel}
      onClick={onClick}
      className={[
        "inline-flex min-h-11 items-center justify-center rounded-lg border px-3 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50",
        pressed
          ? "border-accent bg-accent/15 text-foreground"
          : "border-border bg-surface text-muted hover:border-accent",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}
