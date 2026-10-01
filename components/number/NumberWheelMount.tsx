import { NumberWheel } from "@/components/number/NumberWheel";
import { StaticWheelPreview } from "@/components/StaticWheelPreview";

type Props = {
  initialPresetQuery?: string | null;
};

const PREVIEW = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

export function NumberWheelMount({ initialPresetQuery = null }: Props) {
  return (
    <div className="min-h-[640px] lg:min-h-[560px]">
      <div className="sr-only">
        <StaticWheelPreview choices={PREVIEW} />
        <p>10 numbers on the wheel: 1 to 10.</p>
      </div>
      <NumberWheel initialPresetQuery={initialPresetQuery} />
    </div>
  );
}
