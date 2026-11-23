/**
 * Tiny window-event bridge between the server-rendered name-picker controls
 * (NamePickerTool) and the client-only SpinnerWheel, which is mounted behind a
 * Suspense/useSearchParams boundary and therefore never appears in the SSR HTML.
 */

/** Wheel -> panel: the wheel's parsed list changed (detail: string[]). */
export const NP_NAMES_EVENT = "et:np-names";
/** Panel -> wheel: replace the list text (detail: string). */
export const NP_SET_TEXT_EVENT = "et:np-set-text";
/** Anywhere -> panel: switch mode (detail: "spin" | "list"). */
export const NP_MODE_EVENT = "et:np-mode";

export type NamePickerMode = "spin" | "list";

export const NP_MODE_STORAGE_KEY = "exestools.namepicker.mode.v1";

export function emitNamePickerEvent<T>(name: string, detail: T): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<T>(name, { detail }));
}
