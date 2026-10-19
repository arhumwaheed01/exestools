import { WHEEL_COLORS, truncateLabel } from "@/lib/wheel";

type Props = {
  choices: string[];
  className?: string;
};

/** Server-renderable SVG wheel matching the glossy canvas look (gold rim + bulbs). */
export function StaticWheelPreview({ choices, className = "" }: Props) {
  const n = Math.max(choices.length, 1);
  const slice = (Math.PI * 2) / n;
  const size = 420;
  const cx = size / 2;
  const cy = size / 2;
  const rimPad = 18;
  const r = size / 2 - rimPad;
  const bulbs = 24;

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
          const tx = cx + r * 0.62 * Math.cos(mid);
          const ty = cy + r * 0.62 * Math.sin(mid);
          const fill = WHEEL_COLORS[i % WHEEL_COLORS.length]!;
          return (
            <g key={`${label}-${i}`}>
              <path
                d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
                fill={fill}
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="1.5"
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
    <div
      className={`aspect-square w-full max-w-[min(420px,100%)] ${className}`}
      style={{ aspectRatio: "1 / 1" }}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="h-full w-full drop-shadow-xl"
        role="img"
        aria-label={`Spinner preview with ${choices.length} choices`}
      >
        <defs>
          <linearGradient id="et-static-rim" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#b45309" />
            <stop offset="35%" stopColor="#fbbf24" />
            <stop offset="55%" stopColor="#fde68a" />
            <stop offset="75%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>
          <radialGradient id="et-static-hub" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0b0f17" />
          </radialGradient>
        </defs>

        <circle cx={cx} cy={cy + 6} r={r + 10} fill="rgba(0,0,0,0.28)" />
        {segments ?? (
          <>
            <circle cx={cx} cy={cy} r={r} fill="#1c2430" />
            <text
              x={cx}
              y={cy}
              fill="#94a3b8"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="16"
            >
              Add choices
            </text>
          </>
        )}

        <circle
          cx={cx}
          cy={cy}
          r={r + 12}
          fill="none"
          stroke="url(#et-static-rim)"
          strokeWidth="14"
        />
        {Array.from({ length: bulbs }, (_, i) => {
          const a = (i / bulbs) * Math.PI * 2 - Math.PI / 2;
          const bx = cx + Math.cos(a) * (r + 7);
          const by = cy + Math.sin(a) * (r + 7);
          return (
            <circle key={i} cx={bx} cy={by} r={2.4} fill="#fef08a" stroke="#fde047" strokeWidth="1" />
          );
        })}

        <circle
          cx={cx}
          cy={cy}
          r={Math.max(22, r * 0.12)}
          fill="url(#et-static-hub)"
          stroke="#e2e8f0"
          strokeWidth="3"
        />
        <text
          x={cx}
          y={cy + 1}
          fill="#e2e8f0"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="14"
          fontWeight="800"
        >
          ET
        </text>

        {/* Teardrop pointer */}
        <path
          d={`M ${cx} 4 C ${cx} 4 ${cx - 14} 22 ${cx - 14} 16 C ${cx - 14} 8.3 ${cx - 7.7} 3 ${cx} 3 C ${cx + 7.7} 3 ${cx + 14} 8.3 ${cx + 14} 16 C ${cx + 14} 22 ${cx} 4 ${cx} 4 Z`}
          fill="#cbd5e1"
          stroke="#64748b"
          strokeWidth="1"
        />
        <circle cx={cx} cy={16} r={4.5} fill="#22d3ee" stroke="#0b0f17" strokeWidth="1.5" />
      </svg>
    </div>
  );
}
