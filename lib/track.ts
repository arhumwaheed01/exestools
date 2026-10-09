/**
 * Phase 2 GA4 helper. Never send choice text / PII in props.
 * Events: spin, preset_load, share_create, share_open, return_visit, entries_edited.
 */
import { GA_MEASUREMENT_ID } from "@/lib/analytics";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(event: string, props: Record<string, unknown> = {}): void {
  if (!GA_MEASUREMENT_ID) return;
  if (typeof window === "undefined") return;
  try {
    // Strip accidental PII-ish keys if ever passed.
    const safe: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(props)) {
      if (k === "choices" || k === "text" || k === "label" || k === "winner") continue;
      if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
        safe[k] = v;
      }
    }
    // Consent snippet defines gtag beforeInteractive; events queue until gtag.js loads.
    window.dataLayer = window.dataLayer || [];
    if (typeof window.gtag === "function") {
      window.gtag("event", event, safe);
    } else {
      window.dataLayer.push({ event, ...safe });
    }
  } catch {
    /* ignore */
  }
}
