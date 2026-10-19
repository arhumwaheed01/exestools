"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from "react";
import { ChevronDown } from "lucide-react";

export type MoreMenuItem = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

type Props = {
  items: MoreMenuItem[];
  label?: string;
  className?: string;
  trailing?: ReactNode;
  buttonRef?: Ref<HTMLButtonElement>;
};

export function MoreMenu({
  items,
  label = "More",
  className = "",
  trailing,
  buttonRef,
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

  return (
    <div ref={rootRef} className={`relative inline-flex flex-wrap items-center gap-2 ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-accent/50 bg-surface px-4 text-sm font-bold text-foreground outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
      >
        {label}
        <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open ? (
        <ul
          id={menuId}
          role="menu"
          className="absolute left-0 top-full z-40 mt-1 min-w-[12rem] overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-xl"
        >
          {items.map((item) => (
            <li key={item.label} role="none">
              <button
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  setOpen(false);
                  item.onClick();
                }}
                className="flex w-full min-h-11 items-center px-4 text-left text-sm font-semibold text-foreground outline-none hover:bg-surface-2 focus-visible:bg-surface-2 disabled:opacity-40"
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {trailing}
    </div>
  );
}
