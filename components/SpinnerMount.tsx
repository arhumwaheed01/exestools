import { StaticWheelPreview } from "@/components/StaticWheelPreview";
import { SpinnerWheel } from "@/components/SpinnerWheel";
import {
  ALLOWED_PRESET_QUERY,
  defaultChoicesForTool,
  getPresetById,
  TOOL_DEFAULTS,
} from "@/lib/presets";
import type { ToolId } from "@/lib/tools";

type Props = {
  toolId: ToolId;
  initialEncoded?: string | null;
  initialPresetQuery?: string | null;
};

export function SpinnerMount({
  toolId,
  initialEncoded = null,
  initialPresetQuery = null,
}: Props) {
  const safePreset =
    initialPresetQuery && ALLOWED_PRESET_QUERY.has(initialPresetQuery)
      ? initialPresetQuery
      : null;
  const previewChoices =
    (safePreset && getPresetById(safePreset)?.choices) || defaultChoicesForTool(toolId);
  const cfg = TOOL_DEFAULTS[toolId];

  return (
    <div>
      <div className="sr-only" aria-hidden>
        <StaticWheelPreview choices={[...previewChoices]} />
        <p>
          Tool {toolId}. Default preset {cfg.defaultPresetId}. Options: {previewChoices.join(", ")}.
        </p>
      </div>
      <SpinnerWheel
        toolId={toolId}
        initialEncoded={initialEncoded}
        initialPresetQuery={safePreset}
      />
    </div>
  );
}
