"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import {
  LuAlignCenter,
  LuAlignLeft,
  LuAlignRight,
  LuBold,
  LuItalic,
  LuStrikethrough,
  LuUnderline,
} from "react-icons/lu";

export type TextBarAction =
  | "underline"
  | "strikethrough"
  | "alignLeft"
  | "alignCenter"
  | "alignRight"
  | "lineTight"
  | "lineLoose";

const FONT_SIZES = [10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 42, 48, 56, 64, 72] as const;

type Props = {
  position: { centerX: number; top: number } | null;
  fontFamily: string;
  fontOptions: readonly string[];
  /** Reflects active Fabric Textbox when bar is visible */
  formatting: { bold: boolean; italic: boolean; fontSize: number; fill: string } | null;
  onFontFamily: (value: string) => void;
  onFontSize: (value: number) => void;
  onFillColor: (value: string) => void;
  onToggleBold: () => void;
  onToggleItalic: () => void;
  onAction: (action: TextBarAction) => void;
};

function BarBtn({
  label,
  onClick,
  pressed,
  children,
}: {
  label: string;
  onClick: () => void;
  pressed?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={pressed}
      onMouseDown={(e) => e.preventDefault()}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-zinc-100 transition-colors hover:bg-white/15 hover:text-white ${
        pressed ? "bg-white/20 text-white" : ""
      }`}
    >
      {children}
    </button>
  );
}

/** Acrobat-style dark floating bar above the active text box. */
export function FloatingTextFormatBar({
  position,
  fontFamily,
  fontOptions,
  formatting,
  onFontFamily,
  onFontSize,
  onFillColor,
  onToggleBold,
  onToggleItalic,
  onAction,
}: Props) {
  if (!position) return null;

  const bold = formatting?.bold ?? false;
  const italic = formatting?.italic ?? false;
  const fontSize = formatting?.fontSize ?? 18;
  const fill = formatting?.fill ?? "#111827";

  const sizeOptions = useMemo(() => {
    if (FONT_SIZES.includes(fontSize as (typeof FONT_SIZES)[number])) return [...FONT_SIZES];
    return [...FONT_SIZES, fontSize].sort((a, b) => a - b);
  }, [fontSize]);

  return (
    <div
      className="pointer-events-auto fixed z-[70] flex max-w-[calc(100vw-1.5rem)] -translate-x-1/2 flex-wrap items-center gap-0.5 rounded-lg border border-zinc-600/90 bg-zinc-900/96 px-1 py-1 shadow-2xl backdrop-blur-sm"
      style={{ left: position.centerX, top: Math.max(8, position.top) }}
      role="toolbar"
      aria-label="Text formatting"
      onMouseDown={(e) => e.preventDefault()}
    >
      <BarBtn label="Bold" pressed={bold} onClick={onToggleBold}>
        <LuBold className="h-4 w-4" />
      </BarBtn>
      <BarBtn label="Italic" pressed={italic} onClick={onToggleItalic}>
        <LuItalic className="h-4 w-4" />
      </BarBtn>
      <div className="mx-0.5 flex h-8 items-center border-r border-zinc-600/80 pr-1">
        <label className="sr-only" htmlFor="pdf-float-size">
          Font size
        </label>
        <select
          id="pdf-float-size"
          value={fontSize}
          onChange={(e) => onFontSize(Number(e.target.value))}
          onMouseDown={(e) => e.stopPropagation()}
          className="h-8 w-[3.25rem] cursor-pointer rounded-md border-0 bg-zinc-800 px-1 text-xs text-zinc-100 outline-none focus:ring-2 focus:ring-sky-500/60"
        >
          {sizeOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="flex h-8 items-center border-r border-zinc-600/80 pr-1">
        <label className="sr-only" htmlFor="pdf-float-color">
          Text color
        </label>
        <input
          id="pdf-float-color"
          type="color"
          value={/^#[0-9A-Fa-f]{6}$/.test(fill) ? fill : "#111827"}
          onChange={(e) => onFillColor(e.target.value)}
          onMouseDown={(e) => e.stopPropagation()}
          className="h-7 w-9 cursor-pointer overflow-hidden rounded border border-zinc-600 bg-zinc-800 p-0"
          title="Text color"
        />
      </div>
      <label className="sr-only" htmlFor="pdf-float-font">
        Font
      </label>
      <div className="flex h-8 items-center border-r border-zinc-600/80 pr-1">
        <select
          id="pdf-float-font"
          value={fontFamily}
          onChange={(e) => onFontFamily(e.target.value)}
          onMouseDown={(e) => e.stopPropagation()}
          className="h-8 max-w-[7.5rem] cursor-pointer truncate rounded-md border-0 bg-zinc-800 px-1.5 text-xs text-zinc-100 outline-none focus:ring-2 focus:ring-sky-500/60 md:max-w-[9rem]"
        >
          {fontOptions.map((f) => (
            <option key={f} value={f}>
              {f.split(",")[0]}
            </option>
          ))}
        </select>
      </div>
      <BarBtn label="Underline" onClick={() => onAction("underline")}>
        <LuUnderline className="h-4 w-4" />
      </BarBtn>
      <BarBtn label="Strikethrough" onClick={() => onAction("strikethrough")}>
        <LuStrikethrough className="h-4 w-4" />
      </BarBtn>
      <div className="mx-0.5 h-5 w-px bg-zinc-600/80" />
      <BarBtn label="Align left" onClick={() => onAction("alignLeft")}>
        <LuAlignLeft className="h-4 w-4" />
      </BarBtn>
      <BarBtn label="Align center" onClick={() => onAction("alignCenter")}>
        <LuAlignCenter className="h-4 w-4" />
      </BarBtn>
      <BarBtn label="Align right" onClick={() => onAction("alignRight")}>
        <LuAlignRight className="h-4 w-4" />
      </BarBtn>
      <div className="mx-0.5 h-5 w-px bg-zinc-600/80" />
      <BarBtn label="Tighter line height" onClick={() => onAction("lineTight")}>
        <span className="text-xs font-semibold tabular-nums text-zinc-200">A⁻</span>
      </BarBtn>
      <BarBtn label="Looser line height" onClick={() => onAction("lineLoose")}>
        <span className="text-xs font-semibold tabular-nums text-zinc-200">A⁺</span>
      </BarBtn>
    </div>
  );
}
