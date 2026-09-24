import { WHEEL_COLORS, truncateLabel } from "@/lib/wheel";

type Props = {
  choices: string[];
  className?: string;
};

/** Server-renderable SVG wheel so View-source shows labels and layout is reserved. */
export function StaticWheelPreview({ choices, className = "" }: Props) {
  const n = Math.max(choices.length, 1);
  const slice = (Math.PI * 2) / n;
  const size = 420;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 10;

  const segments =
    choices.length === 0
      ? null
      : choices.map((label, i) => {
          const start = i * slice - Math.PI / 2;
          const end = start + slice;
          const x1 = cx + r * Math.cos(start);
          const y1 = cy + r * Math.sin(start);
          const x2 = cx + r * Math.cos(end);
          const y2 = cy + r * Math.sin(end);
          const large = slice > Math.PI ? 1 : 0;
          const mid = start + slice / 2;
          const tx = cx + (r * 0.62) * Math.cos(mid);
          const ty = cy + (r * 0.62) * Math.sin(mid);
          return (
            <g key={`${label}-${i}`}>
              <path
                d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
                fill={WHEEL_COLORS[i % WHEEL_COLORS.length]}
                stroke="rgba(255,255,255,0.45)"
                strokeWidth="2"
              />
              <text
                x={tx}
                y={ty}
                fill="#fff"
                fontSize={n > 10 ? 11 : 13}
                fontWeight="700"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {truncateLabel(label, n > 14 ? 10 : 14)}
              </text>
            </g>
          );
        });

  return (
    <div className={`aspect-square w-full max-w-[420px] ${className}`}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="h-full w-full"
        role="img"
        aria-label={`Spinner preview with ${choices.length} choices`}
      >
        <circle cx={cx} cy={cy} r={r + 5} fill="#0f172a" />
        {segments ?? (
          <>
            <circle cx={cx} cy={cy} r={r} fill="#1c2430" />
            <text x={cx} y={cy} fill="#94a3b8" textAnchor="middle" dominantBaseline="middle" fontSize="16">
              Add choices
            </text>
          </>
        )}
        <circle cx={cx} cy={cy} r={Math.max(22, r * 0.1)} fill="#e2e8f0" stroke="#0f172a" strokeWidth="3" />
        <polygon points={`${cx},8 ${cx - 12},28 ${cx + 12},28`} fill="#22d3ee" />
      </svg>
    </div>
  );
}
