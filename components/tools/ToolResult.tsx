import type { HTMLAttributes } from "react";

type Props = {
  label: string;
  children: string;
  emptyHint: string;
  helperText?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, "children">;

export function ToolResult({
  label,
  children,
  emptyHint,
  helperText = "Output updates automatically as you edit input.",
  className = "",
  ...rest
}: Props) {
  const isEmpty = !children;

  return (
    <div
      className={`flex min-h-0 min-w-0 flex-col gap-2 ${className}`.trim()}
      {...rest}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-secondary-text">{label}</p>
        <span className="rounded-full border border-primary/20 bg-primary/8 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
          Live preview
        </span>
      </div>
      <p className="text-xs text-secondary-text/75">{helperText}</p>
      <div
        className="relative min-h-[min(12rem,40vh)] flex-1 overflow-hidden rounded-xl border border-input-border/80 bg-surface/80 p-4 ring-1 ring-black/3 md:p-5 lg:min-h-[280px]"
        role="region"
        aria-label={label}
        aria-live="polite"
      >
        <pre
          className={`font-sans m-0 max-h-[min(50vh,32rem)] min-h-0 overflow-auto whitespace-pre-wrap wrap-break-word text-sm leading-relaxed md:text-base ${
            isEmpty ? "text-secondary-text/45" : "text-secondary-text"
          }`}
        >
          {isEmpty ? emptyHint : children}
        </pre>
      </div>
    </div>
  );
}
