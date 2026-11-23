import Image from "next/image";

const ALTS: Record<string, string> = {
  home: "Spinner wheel stopped on a chosen option under the pointer",
  "random-name-picker": "Numbered list of five names drawn without repeats",
  "classroom-spinner": "Classroom spinner with roster attendance toggles and a picked student",
  "prize-wheel": "Prize wheel result with a won gift and remaining stock quantities",
  "yes-no-wheel": "Yes or no wheel result showing YES with a running tally",
  "random-team-generator": "Two random teams of six names each after a split",
  "secret-santa-generator": "Secret Santa draw with private reveal links ready to copy",
  "random-number-wheel": "Number wheel result highlighting 47 with recent draws listed",
  "raffle-generator": "Raffle draw record showing winners, alternates and a draw code",
  "bingo-card-generator": "Grid of printable bingo cards made from a custom word list",
  "time-card-calculator": "Filled weekly timesheet summary with regular, overtime and gross pay",
};

/** One original result screenshot per tool page (AdSense inventory signal). */
export function ToolResultShot({ toolId }: { toolId: string }) {
  const alt = ALTS[toolId];
  if (!alt) return null;
  return (
    <figure className="mt-8 max-w-3xl overflow-hidden rounded-2xl border border-border bg-surface">
      <Image
        src={`/tools/screenshots/${toolId}.jpg`}
        alt={alt}
        width={1280}
        height={720}
        className="h-auto w-full"
        sizes="(max-width: 768px) 100vw, 48rem"
      />
      <figcaption className="border-t border-border px-4 py-2 text-xs text-muted">{alt}</figcaption>
    </figure>
  );
}
