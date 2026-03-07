interface ZodiacWheelProps {
  className?: string;
  opacity?: number;
}

const ZODIAC_SYMBOLS = [
  "♈",
  "♉",
  "♊",
  "♋",
  "♌",
  "♍",
  "♎",
  "♏",
  "♐",
  "♑",
  "♒",
  "♓",
];

export function ZodiacWheel({
  className = "",
  opacity = 0.15,
}: ZodiacWheelProps) {
  const cx = 200;
  const cy = 200;
  const r = 180;
  const innerR = 140;
  const symbolR = 162;

  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      style={{ opacity }}
      aria-hidden="true"
    >
      {/* Outer ring */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.8"
      />
      {/* Inner ring */}
      <circle
        cx={cx}
        cy={cy}
        r={innerR}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
      />
      {/* Core ring */}
      <circle
        cx={cx}
        cy={cy}
        r={100}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
      />
      <circle
        cx={cx}
        cy={cy}
        r={60}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.4"
      />
      <circle
        cx={cx}
        cy={cy}
        r={20}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.4"
      />

      {/* Spokes and symbols */}
      {ZODIAC_SYMBOLS.map((symbol, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const nextAngle = ((i + 1) * 30 - 90) * (Math.PI / 180);
        const midAngle = angle + 15 * (Math.PI / 180);

        // Spoke line
        const x1 = cx + innerR * Math.cos(angle);
        const y1 = cy + innerR * Math.sin(angle);
        const x2 = cx + r * Math.cos(angle);
        const y2 = cy + r * Math.sin(angle);

        // Symbol position
        const sx = cx + symbolR * Math.cos(midAngle);
        const sy = cy + symbolR * Math.sin(midAngle);

        // Arc path for this segment
        const arcX1 = cx + r * Math.cos(angle);
        const arcY1 = cy + r * Math.sin(angle);
        const arcX2 = cx + r * Math.cos(nextAngle);
        const arcY2 = cy + r * Math.sin(nextAngle);

        return (
          <g key={symbol}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeWidth="0.5"
            />
            <path
              d={`M ${arcX1} ${arcY1} A ${r} ${r} 0 0 1 ${arcX2} ${arcY2}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
            />
            <text
              x={sx}
              y={sy}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="12"
              fill="currentColor"
            >
              {symbol}
            </text>
          </g>
        );
      })}

      {/* Center star */}
      <circle cx={cx} cy={cy} r={4} fill="currentColor" />
      {[0, 60, 120, 180, 240, 300].map((deg) => {
        const a = deg * (Math.PI / 180);
        return (
          <line
            key={deg}
            x1={cx + 4 * Math.cos(a)}
            y1={cy + 4 * Math.sin(a)}
            x2={cx + 16 * Math.cos(a)}
            y2={cy + 16 * Math.sin(a)}
            stroke="currentColor"
            strokeWidth="0.6"
          />
        );
      })}

      {/* Decorative star dots */}
      {Array.from({ length: 24 }, (_, i) => {
        const deg = i * 15;
        const a = deg * (Math.PI / 180);
        const dotR = i % 3 === 0 ? 106 : 104;
        const x = cx + dotR * Math.cos(a);
        const y = cy + dotR * Math.sin(a);
        return (
          <circle
            key={`dot-${deg}`}
            cx={x}
            cy={y}
            r={i % 4 === 0 ? 1.5 : 0.8}
            fill="currentColor"
          />
        );
      })}
    </svg>
  );
}
