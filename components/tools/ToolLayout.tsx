import type { ReactNode } from "react";

type Props = {
  /** Main input column */
  input: ReactNode;
  /** Output or stats column */
  result: ReactNode;
  /** Copy / clear actions row (full width below columns on large screens) */
  actions?: ReactNode;
};

/**
 * Responsive two-column tool workspace: stacks on small screens, side-by-side from lg.
 */
export function ToolLayout({ input, result, actions }: Props) {
  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-xs font-semibold tracking-wide text-primary">
          Live tool
        </span>
        <span className="rounded-full border border-input-border bg-background px-3 py-1 text-xs font-medium text-secondary-text/80">
          Runs in your browser
        </span>
      </div>
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:items-stretch lg:gap-8">
        <div className="flex min-h-0 min-w-0 flex-col">{input}</div>
        <div className="flex min-h-0 min-w-0 flex-col">{result}</div>
      </div>
      {actions ? (
        <div className="flex flex-wrap gap-3 rounded-xl border border-input-border/70 bg-surface/70 p-4">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
