"use client";

import { useEffect, useId, useRef, useState } from "react";
import { MoreVertical, Volume2, VolumeX } from "lucide-react";

type Props = {
  onEmbed: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  disabled?: boolean;
  className?: string;
};

/** Top-left ⋮ menu on the wheel stage (Embed, Sound, etc.). */
export function WheelOverflowMenu({
  onEmbed,
  soundEnabled,
  onToggleSound,
  disabled,
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const itemCls =
    "flex w-full min-h-10 items-center gap-2 px-3 text-left text-sm font-semibold text-foreground outline-none hover:bg-surface-2 focus-visible:bg-surface-2";

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label="More wheel options"
        title="More options"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border-0 bg-transparent text-foreground outline-none hover:bg-surface-2/60 focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
      >
        <MoreVertical className="h-4 w-4" aria-hidden />
      </button>
      {open ? (
        <ul
          id={menuId}
          role="menu"
          className="absolute left-0 top-full z-40 mt-1 min-w-[12rem] overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-xl"
        >
          <li role="none">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onToggleSound();
                setOpen(false);
              }}
              className={itemCls}
            >
              {soundEnabled ? (
                <Volume2 className="h-3.5 w-3.5 text-accent" aria-hidden />
              ) : (
                <VolumeX className="h-3.5 w-3.5 text-muted" aria-hidden />
              )}
              Sound {soundEnabled ? "on" : "off"}
            </button>
          </li>
          <li role="none">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onEmbed();
              }}
              className={itemCls}
            >
              Embed this wheel
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  );
}
