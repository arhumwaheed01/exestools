"use client";

import type { Card } from "@/lib/bingo/cards";

export function BingoPlayerLinks({
  cards,
  playerCardN,
  setPlayerCardN,
  onCopyLink,
  onShareLink,
  onCopyAll,
  canShare,
}: {
  cards: Card[];
  playerCardN: number;
  setPlayerCardN: (n: number) => void;
  onCopyLink: () => void;
  onShareLink: () => void;
  onCopyAll: () => void;
  canShare: boolean;
}) {
  return (
    <div className="mt-3 space-y-2 rounded-2xl border border-border p-3">
      <p className="text-xs text-muted">
        Each link opens one card. Anyone with a link can see that card, so send each link to
        one person.
      </p>
      <div className="flex flex-wrap items-end gap-2">
        <div>
          <label htmlFor="bg-plink" className="text-xs text-muted">
            Card
          </label>
          <select
            id="bg-plink"
            value={playerCardN}
            onChange={(e) => setPlayerCardN(Number(e.target.value))}
            className="mt-1 block min-h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {cards.map((c) => (
              <option key={c.number} value={c.number}>
                {c.number}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={onCopyLink}
          className="inline-flex min-h-11 items-center rounded-xl border border-border px-3 text-xs font-bold outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
        >
          Copy link
        </button>
        {canShare ? (
          <button
            type="button"
            onClick={onShareLink}
            className="inline-flex min-h-11 items-center rounded-xl border border-border px-3 text-xs font-bold outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
          >
            Share
          </button>
        ) : null}
        <button
          type="button"
          onClick={onCopyAll}
          className="inline-flex min-h-11 items-center rounded-xl border border-border px-3 text-xs font-bold outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
        >
          Copy all links
        </button>
      </div>
    </div>
  );
}
