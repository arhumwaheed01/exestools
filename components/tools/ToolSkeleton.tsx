/** Layout placeholder while a client tool hydrates. */
export function ToolSkeleton({
  variant = "default",
}: {
  variant?: "default" | "santa" | "raffle";
}) {
  return (
    <div className="min-w-0 space-y-4" aria-hidden>
      {variant === "santa" || variant === "raffle" ? (
        <div
          className={`h-28 animate-pulse rounded-3xl ${
            variant === "santa" ? "et-tool-hero-santa" : "et-tool-hero-raffle"
          } opacity-70`}
        />
      ) : null}
      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <div className="min-h-[320px] animate-pulse rounded-3xl border border-border bg-surface p-5">
          <div className="h-4 w-40 rounded bg-surface-2" />
          <div className="mt-4 h-11 rounded-xl bg-surface-2" />
          <div className="mt-3 flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-9 w-20 rounded-full bg-surface-2" />
            ))}
          </div>
          <div className="mt-8 h-12 rounded-xl bg-surface-2" />
        </div>
        <div className="min-h-[240px] animate-pulse rounded-3xl border border-border bg-surface p-5">
          <div className="h-4 w-32 rounded bg-surface-2" />
          <div className="mt-4 space-y-2">
            <div className="h-12 rounded-xl bg-surface-2" />
            <div className="h-12 rounded-xl bg-surface-2" />
            <div className="h-12 rounded-xl bg-surface-2" />
          </div>
        </div>
      </div>
    </div>
  );
}
