import type { ToolId } from "@/lib/tools";

/** Per-button visibility for the wheel chrome. */
export type WheelToolbarFeatures = {
  customize: boolean;
  new: boolean;
  open: boolean;
  save: boolean;
  share: boolean;
  gallery: boolean;
  startFresh: boolean;
  examples: boolean;
  fullscreen: boolean;
  more: boolean;
  autoRemove: boolean;
  shuffle: boolean;
  sort: boolean;
  addImage: boolean;
  copy: boolean;
  defaults: boolean;
  clear: boolean;
  advanced: boolean;
};

const NONE: WheelToolbarFeatures = {
  customize: false,
  new: false,
  open: false,
  save: false,
  share: false,
  gallery: false,
  startFresh: false,
  examples: false,
  fullscreen: false,
  more: false,
  autoRemove: false,
  shuffle: false,
  sort: false,
  addImage: false,
  copy: false,
  defaults: false,
  clear: false,
  advanced: false,
};

/** True when at least one primary or entries control should render. */
export function toolbarHasAny(f: WheelToolbarFeatures): boolean {
  return Object.values(f).some(Boolean);
}

export function toolbarHasEntriesRow(f: WheelToolbarFeatures): boolean {
  return (
    f.autoRemove ||
    f.shuffle ||
    f.sort ||
    f.addImage ||
    f.copy ||
    f.defaults ||
    f.clear ||
    f.advanced
  );
}

/**
 * Purpose-built toolbar per wheel page so a reviewer doesn't see the same
 * 10-button bar five times. Specialized tools drop file/image/advanced chrome.
 */
export function toolbarFeaturesForTool(toolId: ToolId): WheelToolbarFeatures {
  switch (toolId) {
    case "yes-no-wheel":
      // Decision mode + tally replace the general toolbar.
      return { ...NONE };

    case "home":
      return {
        ...NONE,
        customize: true,
        new: true,
        open: true,
        save: true,
        share: true,
        gallery: true,
        startFresh: true,
        examples: true,
        fullscreen: true,
        more: true,
        autoRemove: true,
        shuffle: true,
        sort: true,
        copy: true,
        clear: true,
        // Unused on the general spinner — keep the homepage distinct.
        addImage: false,
        defaults: false,
        advanced: false,
      };

    case "classroom-spinner":
      return {
        ...NONE,
        share: true,
        startFresh: true,
        examples: true,
        fullscreen: true,
        more: true,
        autoRemove: true,
        shuffle: true,
        sort: true,
        clear: true,
      };

    case "prize-wheel":
      return {
        ...NONE,
        customize: true,
        share: true,
        startFresh: true,
        examples: true,
        fullscreen: true,
        more: true,
        shuffle: true,
        sort: true,
        copy: true,
        clear: true,
      };

    case "random-name-picker":
      return {
        ...NONE,
        share: true,
        startFresh: true,
        examples: true,
        fullscreen: true,
        more: true,
        autoRemove: true,
        shuffle: true,
        sort: true,
        clear: true,
      };

    default:
      return {
        ...NONE,
        customize: true,
        new: true,
        open: true,
        save: true,
        share: true,
        gallery: true,
        startFresh: true,
        examples: true,
        fullscreen: true,
        more: true,
        autoRemove: true,
        shuffle: true,
        sort: true,
        addImage: true,
        copy: true,
        defaults: true,
        clear: true,
        advanced: true,
      };
  }
}
