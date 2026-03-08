interface ZodiacWheelProps {
  className?: string;
  opacity?: number;
  spinning?: boolean;
}

const ZODIAC_SIGNS = [
  { symbol: "♈", name: "मेष" },
  { symbol: "♉", name: "वृषभ" },
  { symbol: "♊", name: "मिथुन" },
  { symbol: "♋", name: "कर्क" },
  { symbol: "♌", name: "सिंह" },
  { symbol: "♍", name: "कन्या" },
  { symbol: "♎", name: "तुला" },
  { symbol: "♏", name: "वृश्चिक" },
  { symbol: "♐", name: "धनु" },
  { symbol: "♑", name: "मकर" },
  { symbol: "♒", name: "कुम्भ" },
  { symbol: "♓", name: "मीन" },
];

export function ZodiacWheel({
  className = "",
  opacity = 0.15,
  spinning = false,
}: ZodiacWheelProps) {
  const cx = 200;
  const cy = 200;
  const r = 175;
  const outerDecorR = 185;
  const midR = 160;
  const innerR = 130;
  const symbolR = 152;
  const nameR = 112;

  return (
    <svg
      viewBox="0 0 400 400"
      className={`${className}${spinning ? " animate-spin-slow" : ""}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <defs>
        {/* Multi-layer golden glow filter */}
        <filter id="zodiac-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.5" result="blur1" />
          <feGaussianBlur
            stdDeviation="1.2"
            result="blur2"
            in="SourceGraphic"
          />
          <feColorMatrix
            in="blur1"
            type="matrix"
            values="1.4 0.6 0 0 0.15
                    0.8 0.9 0 0 0.05
                    0   0   0 0 0
                    0   0   0 1.2 0"
            result="goldenBlur"
          />
          <feMerge>
            <feMergeNode in="goldenBlur" />
            <feMergeNode in="blur2" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Text glow filter for zodiac names */}
        <filter id="text-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1.5 0.6 0 0 0.18
                    0.9 0.9 0 0 0.06
                    0   0   0 0 0
                    0   0   0 1.4 0"
            result="goldenTextGlow"
          />
          <feMerge>
            <feMergeNode in="goldenTextGlow" />
            <feMergeNode in="goldenTextGlow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Intense center glow */}
        <filter
          id="zodiac-core-glow"
          x="-60%"
          y="-60%"
          width="220%"
          height="220%"
        >
          <feGaussianBlur stdDeviation="6" result="bigBlur" />
          <feColorMatrix
            in="bigBlur"
            type="matrix"
            values="1.6 0.5 0 0 0.2
                    0.9 1.0 0 0 0.08
                    0   0   0 0 0
                    0   0   0 0.9 0"
            result="goldenCore"
          />
          <feMerge>
            <feMergeNode in="goldenCore" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Radial golden halo behind wheel */}
        <radialGradient id="wheel-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f5c842" stopOpacity="0.22" />
          <stop offset="40%" stopColor="#d4a017" stopOpacity="0.10" />
          <stop offset="75%" stopColor="#b8860b" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#b8860b" stopOpacity="0" />
        </radialGradient>

        {/* Gold stroke color */}
        <style>{`
          .zodiac-gold { color: #f5c842; }
        `}</style>
      </defs>

      {/* ── Radial halo glow behind wheel ── */}
      <circle cx={cx} cy={cy} r={195} fill="url(#wheel-halo)" />

      {/* ── Outer ambient ring pulse ── */}
      <circle
        cx={cx}
        cy={cy}
        r={185}
        fill="none"
        stroke="#f5c842"
        strokeWidth="0.6"
        opacity="0.18"
        filter="url(#zodiac-core-glow)"
      />

      {/* ── Main wheel group with glow ── */}
      <g filter="url(#zodiac-glow)" stroke="#f5c842" fill="#f5c842">
        {/* Decorative outer ring (double-ring effect) */}
        <circle
          cx={cx}
          cy={cy}
          r={outerDecorR}
          fill="none"
          stroke="#f5c842"
          strokeWidth="0.5"
          opacity="0.55"
        />

        {/* Outer ring */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#f5c842"
          strokeWidth="1.2"
          opacity="0.9"
        />

        {/* Mid ring */}
        <circle
          cx={cx}
          cy={cy}
          r={midR}
          fill="none"
          stroke="#f5c842"
          strokeWidth="0.4"
          opacity="0.45"
        />

        {/* Inner ring */}
        <circle
          cx={cx}
          cy={cy}
          r={innerR}
          fill="none"
          stroke="#f5c842"
          strokeWidth="0.7"
          opacity="0.75"
        />

        {/* Core rings */}
        <circle
          cx={cx}
          cy={cy}
          r={90}
          fill="none"
          stroke="#f5c842"
          strokeWidth="0.6"
          opacity="0.6"
        />
        <circle
          cx={cx}
          cy={cy}
          r={55}
          fill="none"
          stroke="#f5c842"
          strokeWidth="0.5"
          opacity="0.5"
        />
        <circle
          cx={cx}
          cy={cy}
          r={20}
          fill="none"
          stroke="#f5c842"
          strokeWidth="0.5"
          opacity="0.5"
        />

        {/* ── Alternate segment fills ── */}
        {ZODIAC_SIGNS.map(({ symbol }, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const nextAngle = ((i + 1) * 30 - 90) * (Math.PI / 180);

          // Segment arc path between outerR and innerR
          const x1 = cx + r * Math.cos(angle);
          const y1 = cy + r * Math.sin(angle);
          const x2 = cx + r * Math.cos(nextAngle);
          const y2 = cy + r * Math.sin(nextAngle);
          const ix1 = cx + innerR * Math.cos(nextAngle);
          const iy1 = cy + innerR * Math.sin(nextAngle);
          const ix2 = cx + innerR * Math.cos(angle);
          const iy2 = cy + innerR * Math.sin(angle);

          const segPath = [
            `M ${x1} ${y1}`,
            `A ${r} ${r} 0 0 1 ${x2} ${y2}`,
            `L ${ix1} ${iy1}`,
            `A ${innerR} ${innerR} 0 0 0 ${ix2} ${iy2}`,
            "Z",
          ].join(" ");

          return (
            <path
              key={`fill-${symbol}`}
              d={segPath}
              fill="#f5c842"
              opacity={i % 2 === 0 ? 0.07 : 0.03}
            />
          );
        })}

        {/* ── Spokes, symbols and names ── */}
        {ZODIAC_SIGNS.map(({ symbol, name }, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const nextAngle = ((i + 1) * 30 - 90) * (Math.PI / 180);
          const midAngle = angle + 15 * (Math.PI / 180);

          // Spoke line (inner ring → outer ring)
          const x1 = cx + innerR * Math.cos(angle);
          const y1 = cy + innerR * Math.sin(angle);
          const x2 = cx + r * Math.cos(angle);
          const y2 = cy + r * Math.sin(angle);

          // Diamond marker at spoke / outer ring intersection
          const dx = cx + r * Math.cos(angle);
          const dy = cy + r * Math.sin(angle);
          const ds = 2.4; // half-size of diamond

          // Symbol position (outer band)
          const sx = cx + symbolR * Math.cos(midAngle);
          const sy = cy + symbolR * Math.sin(midAngle);

          // Name position (inner band)
          const nx = cx + nameR * Math.cos(midAngle);
          const ny = cy + nameR * Math.sin(midAngle);

          // Rotation angle for name text (tangent to circle)
          const rotDeg = (i * 30 - 90 + 15) % 360;

          // Arc path for outer segment border
          const arcX1 = cx + r * Math.cos(angle);
          const arcY1 = cy + r * Math.sin(angle);
          const arcX2 = cx + r * Math.cos(nextAngle);
          const arcY2 = cy + r * Math.sin(nextAngle);

          // Diamond points (rotated 45°) at spoke/ring intersection
          const spokeDeg = i * 30 - 90;
          const diamondPath = `
            M ${dx + ds * Math.cos(((spokeDeg - 90) * Math.PI) / 180)} ${dy + ds * Math.sin(((spokeDeg - 90) * Math.PI) / 180)}
            L ${dx + ds * Math.cos((spokeDeg * Math.PI) / 180)} ${dy + ds * Math.sin((spokeDeg * Math.PI) / 180)}
            L ${dx + ds * Math.cos(((spokeDeg + 90) * Math.PI) / 180)} ${dy + ds * Math.sin(((spokeDeg + 90) * Math.PI) / 180)}
            L ${dx + ds * Math.cos(((spokeDeg + 180) * Math.PI) / 180)} ${dy + ds * Math.sin(((spokeDeg + 180) * Math.PI) / 180)}
            Z
          `;

          return (
            <g key={symbol}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#f5c842"
                strokeWidth="0.6"
                opacity="0.6"
              />
              <path
                d={`M ${arcX1} ${arcY1} A ${r} ${r} 0 0 1 ${arcX2} ${arcY2}`}
                fill="none"
                stroke="#f5c842"
                strokeWidth="0.6"
                opacity="0.5"
              />
              {/* Diamond marker at spoke/outer ring intersection */}
              <path d={diamondPath} fill="#f5d060" opacity="0.9" />
              {/* Zodiac symbol */}
              <text
                x={sx}
                y={sy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="11"
                fill="#f5d060"
                opacity="0.95"
              >
                {symbol}
              </text>
              {/* Zodiac name in Devanagari — rotated along the ring, glowing */}
              <text
                x={nx}
                y={ny}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="9.5"
                fill="#fff8c0"
                opacity="1"
                transform={`rotate(${rotDeg}, ${nx}, ${ny})`}
                fontFamily="serif"
                filter="url(#text-glow)"
              >
                {name}
              </text>
            </g>
          );
        })}

        {/* ── Center star ── */}
        <circle
          cx={cx}
          cy={cy}
          r={5}
          fill="#f5d060"
          opacity="0.95"
          filter="url(#zodiac-core-glow)"
        />
        <circle cx={cx} cy={cy} r={2.5} fill="#fffbe0" opacity="1" />
        {[0, 60, 120, 180, 240, 300].map((deg) => {
          const a = deg * (Math.PI / 180);
          return (
            <line
              key={deg}
              x1={cx + 5 * Math.cos(a)}
              y1={cy + 5 * Math.sin(a)}
              x2={cx + 18 * Math.cos(a)}
              y2={cy + 18 * Math.sin(a)}
              stroke="#f5c842"
              strokeWidth="0.8"
              opacity="0.85"
            />
          );
        })}

        {/* ── Decorative star dots ── */}
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
              r={i % 4 === 0 ? 1.8 : 1.0}
              fill="#f5d060"
              opacity={i % 4 === 0 ? 0.9 : 0.6}
            />
          );
        })}
      </g>
    </svg>
  );
}
