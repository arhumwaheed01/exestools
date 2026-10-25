import { SpinnerWheel, type SpinnerLayout } from "@/components/SpinnerWheel";
import { ALLOWED_PRESET_QUERY } from "@/lib/presets";
import type { ToolId } from "@/lib/tools";

type Props = {
  toolId: ToolId;
  initialEncoded?: string | null;
  initialPresetQuery?: string | null;
  layout?: SpinnerLayout;
};

/**
 * Mounts the interactive wheel. Live entry text for a11y/SEO is rendered inside
 * SpinnerWheel from the real list (avoids a stale default-count preview).
 */
export function SpinnerMount({
  toolId,
  initialEncoded = null,
  initialPresetQuery = null,
  layout = "classic",
}: Props) {
  const safePreset =
    initialPresetQuery && ALLOWED_PRESET_QUERY.has(initialPresetQuery)
      ? initialPresetQuery
      : null;

  return (
    <SpinnerWheel
      toolId={toolId}
      initialEncoded={initialEncoded}
      initialPresetQuery={safePreset}
      layout={layout}
    />
  );
}
