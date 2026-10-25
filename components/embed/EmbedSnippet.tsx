"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { buildEmbedIframeSnippet, embedSlugForToolId } from "@/lib/embed";
import { siteConfig } from "@/lib/seo";
import { encodeShareHash } from "@/lib/share-codec";
import type { ToolId } from "@/lib/tools";
import { track } from "@/lib/track";

type Props = {
  toolId: ToolId;
  choices: string[];
  disabled?: boolean;
  /** Closable popover panel (used from the wheel ⋮ menu). */
  panel?: { open: boolean; onClose: () => void };
};

/** Copyable iframe markup for /embed/[tool]#w=… */
export function EmbedSnippet({ toolId, choices, disabled, panel }: Props) {
  const slug = embedSlugForToolId(toolId);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  const snippet = useMemo(() => {
    if (!slug || choices.length < 1) return null;
    try {
      const hash = encodeShareHash(choices, toolId);
      return buildEmbedIframeSnippet(siteConfig.url, slug, hash);
    } catch {
      return null;
    }
  }, [slug, choices, toolId]);

  useEffect(() => {
    if (!panel?.open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") panel.onClose();
    };
    const onDoc = (e: MouseEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) panel.onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDoc);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDoc);
    };
  }, [panel]);

  if (!slug) return null;
  if (panel && !panel.open) return null;

  const onCopy = async () => {
    if (!snippet) {
      setError("List too long to embed via URL. Shorten the list, then try again.");
      return;
    }
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setError(null);
      track("share_create", { toolId, method: "embed_iframe" });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy — check browser permissions.");
    }
  };

  const body = (
    <>
      <p className="text-xs leading-relaxed text-muted">
        Paste this iframe on a site or LMS page. The list travels in the URL after{" "}
        <code className="rounded bg-background px-1">#</code>, so anyone who can open the embed can
        see the names.
      </p>
      <pre className="mt-2 max-h-36 overflow-auto whitespace-pre-wrap break-all rounded-lg border border-border bg-background p-2 text-[11px] leading-snug text-muted">
        {snippet ??
          '<iframe src="https://www.exestools.com/embed/…" width="100%" height="520" title="ExesTools wheel"></iframe>'}
      </pre>
      <button
        type="button"
        disabled={disabled || choices.length < 1}
        onClick={() => void onCopy()}
        className="mt-2 inline-flex min-h-11 items-center rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold text-foreground hover:border-accent disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {copied ? "Copied" : "Copy embed code"}
      </button>
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
    </>
  );

  if (panel) {
    return (
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        className="absolute left-2 top-12 z-40 w-[min(22rem,calc(100%-1rem))] rounded-xl border border-border bg-surface p-3 shadow-xl"
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <p id={titleId} className="text-sm font-bold text-foreground">
            Embed this wheel
          </p>
          <button
            type="button"
            onClick={panel.onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted outline-none hover:bg-surface-2 hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Close embed panel"
          >
            ×
          </button>
        </div>
        {body}
      </div>
    );
  }

  return (
    <details className="mt-3 max-w-3xl rounded-xl border border-border bg-surface-2 px-3 py-2">
      <summary className="cursor-pointer text-sm font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent">
        Embed this wheel
      </summary>
      <div className="mt-2">{body}</div>
    </details>
  );
}
