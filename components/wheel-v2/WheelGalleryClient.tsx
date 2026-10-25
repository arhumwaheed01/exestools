"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { encodeShareHash } from "@/lib/share-codec";
import { filterGallery } from "@/lib/wheel-v2/gallery";

export function WheelGalleryClient() {
  const [q, setQ] = useState("");
  const wheels = useMemo(() => filterGallery(q), [q]);

  return (
    <div className="mt-6">
      <label className="relative block max-w-md">
        <span className="sr-only">Search gallery</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search food, classroom, weekend…"
          className="min-h-11 w-full rounded-xl border border-border bg-surface py-2 pl-10 pr-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
      </label>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {wheels.map((w) => {
          let hash = "";
          try {
            hash = encodeShareHash(w.choices, "home");
          } catch {
            hash = "";
          }
          // pathname + hash object avoids relative "/wheel-gallery:0"-style 404s
          const openHref = hash
            ? ({ pathname: "/", hash: hash.replace(/^#/, "") } as const)
            : "/";

          return (
            <li key={w.id}>
              <Link
                href={openHref}
                className="flex h-full flex-col rounded-2xl border border-border bg-surface p-4 outline-none transition hover:border-accent focus-visible:ring-2 focus-visible:ring-accent"
              >
                <h2 className="text-base font-extrabold text-foreground">{w.title}</h2>
                <p className="mt-1 flex-1 text-sm text-muted">{w.blurb}</p>
                <p className="mt-3 text-xs font-semibold text-accent">
                  Open · {w.choices.length} options
                </p>
              </Link>
            </li>
          );
        })}
      </ul>

      {wheels.length === 0 ? (
        <p className="mt-8 text-sm text-muted">No wheels match that search. Try another word.</p>
      ) : null}
    </div>
  );
}
