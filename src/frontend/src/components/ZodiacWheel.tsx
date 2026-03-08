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
        {/* ── Golden-Blue dual-tone glow — warm gold bloom over deep blue ── */}
        <filter id="zodiac-glow" x="-30%" y="-30%" width="160%" height="160%">
          {/* Wide gold bloom */}
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation="4"
            result="goldBlur"
          />
          <feColorMatrix
            in="goldBlur"
            type="matrix"
            values="2.0 0.7 0   0 0.28
                    1.2 1.0 0   0 0.12
                    0   0   0.1 0 0
                    0   0   0   1.5 0"
            result="goldLayer"
          />
          {/* Deep blue bloom */}
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation="6"
            result="blueBlur"
          />
          <feColorMatrix
            in="blueBlur"
            type="matrix"
            values="0   0.05 0.3 0 0.02
                    0.1 0.2  0.8 0 0.06
                    0.1 0.35 2.0 0 0.35
                    0   0    0   0.8 0"
            result="blueLayer"
          />
          <feMerge>
            <feMergeNode in="blueLayer" />
            <feMergeNode in="goldLayer" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* ── Devanagari name glow — intense warm gold ── */}
        <filter id="text-glow" x="-80%" y="-80%" width="260%" height="260%">
          {/* Large outer gold halo */}
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="halo" />
          <feColorMatrix
            in="halo"
            type="matrix"
            values="2.2 0.8 0 0 0.30
                    1.4 1.0 0 0 0.14
                    0   0   0 0 0
                    0   0   0 1.8 0"
            result="outerGold"
          />
          {/* Tight inner glow */}
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="inner" />
          <feColorMatrix
            in="inner"
            type="matrix"
            values="1.8 0.5 0 0 0.22
                    1.0 0.9 0 0 0.08
                    0   0   0 0 0
                    0   0   0 1.4 0"
            result="innerGold"
          />
          {/* Subtle blue shimmer beneath */}
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation="3.5"
            result="blueBase"
          />
          <feColorMatrix
            in="blueBase"
            type="matrix"
            values="0   0.1 0.5 0 0.03
                    0.1 0.2 0.9 0 0.05
                    0.1 0.3 2.0 0 0.28
                    0   0   0   0.6 0"
            result="blueShimmer"
          />
          <feMerge>
            <feMergeNode in="blueShimmer" />
            <feMergeNode in="outerGold" />
            <feMergeNode in="innerGold" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* ── Deep indigo-blue core glow for center hub ── */}
        <filter
          id="blue-core-glow"
          x="-100%"
          y="-100%"
          width="300%"
          height="300%"
        >
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation="10"
            result="bigBlue"
          />
          <feColorMatrix
            in="bigBlue"
            type="matrix"
            values="0   0.1 0.5 0 0.05
                    0.1 0.3 1.2 0 0.10
                    0.1 0.4 2.2 0 0.40
                    0   0   0   0.9 0"
            result="blueCore"
          />
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation="4"
            result="nearGlow"
          />
          <feColorMatrix
            in="nearGlow"
            type="matrix"
            values="0.2 0.1 0.6 0 0.05
                    0.1 0.3 1.0 0 0.08
                    0   0.3 2.0 0 0.32
                    0   0   0   0.7 0"
            result="nearBlue"
          />
          <feMerge>
            <feMergeNode in="blueCore" />
            <feMergeNode in="nearBlue" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* ── Outer ring golden-blue dual halo ── */}
        <filter
          id="outer-ring-glow"
          x="-25%"
          y="-25%"
          width="150%"
          height="150%"
        >
          {/* Gold outer glow */}
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="gG" />
          <feColorMatrix
            in="gG"
            type="matrix"
            values="1.8 0.5 0.1 0 0.18
                    1.0 0.9 0.3 0 0.08
                    0.1 0.2 0.5 0 0.05
                    0   0   0   1.3 0"
            result="goldRing"
          />
          {/* Blue inner rim shimmer */}
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="bG" />
          <feColorMatrix
            in="bG"
            type="matrix"
            values="0   0.1 0.4 0 0.03
                    0.1 0.2 0.8 0 0.06
                    0.1 0.3 1.8 0 0.25
                    0   0   0   0.8 0"
            result="blueRim"
          />
          <feMerge>
            <feMergeNode in="blueRim" />
            <feMergeNode in="goldRing" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* ── Spoke glow — golden with blue shadow ── */}
        <filter id="spoke-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation="1.5"
            result="sBlur"
          />
          <feColorMatrix
            in="sBlur"
            type="matrix"
            values="1.6 0.4 0.1 0 0.15
                    0.9 0.8 0.2 0 0.07
                    0.1 0.1 0.3 0 0.02
                    0   0   0   1.2 0"
            result="spkGold"
          />
          <feMerge>
            <feMergeNode in="spkGold" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* ── Radial background halo — golden center to deep blue edge ── */}
        <radialGradient id="wheel-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD700" stopOpacity="0.08" />
          <stop offset="30%" stopColor="#1565C0" stopOpacity="0.10" />
          <stop offset="60%" stopColor="#0d47a1" stopOpacity="0.12" />
          <stop offset="85%" stopColor="#1a237e" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#0a0d1f" stopOpacity="0" />
        </radialGradient>

        {/* ── Outer ambient — blue inside, gold lip at edge ── */}
        <radialGradient id="outer-ambient" cx="50%" cy="50%" r="50%">
          <stop offset="55%" stopColor="#1a237e" stopOpacity="0" />
          <stop offset="72%" stopColor="#1565C0" stopOpacity="0.10" />
          <stop offset="86%" stopColor="#FFD700" stopOpacity="0.20" />
          <stop offset="100%" stopColor="#FFC107" stopOpacity="0.08" />
        </radialGradient>

        {/* ── Even segment fill — deep royal blue ── */}
        <linearGradient id="seg-even" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1565C0" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#0d47a1" stopOpacity="0.06" />
        </linearGradient>

        {/* ── Odd segment fill — warm gold ── */}
        <linearGradient id="seg-odd" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#FFC107" stopOpacity="0.04" />
        </linearGradient>

        {/* ── Center hub gradient — deep blue core with gold fringe ── */}
        <radialGradient id="hub-gradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF8DC" stopOpacity="1.0" />
          <stop offset="30%" stopColor="#FFD700" stopOpacity="0.9" />
          <stop offset="65%" stopColor="#1565C0" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#0d47a1" stopOpacity="0.80" />
        </radialGradient>
      </defs>

      {/* ── Background atmosphere ── */}
      <circle cx={cx} cy={cy} r={198} fill="url(#wheel-halo)" />
      <circle cx={cx} cy={cy} r={195} fill="url(#outer-ambient)" />

      {/* ── Outer pulse rings — alternating blue and gold ── */}
      <circle
        cx={cx}
        cy={cy}
        r={191}
        fill="none"
        stroke="#1565C0"
        strokeWidth="1.2"
        opacity="0.28"
        filter="url(#blue-core-glow)"
      />
      <circle
        cx={cx}
        cy={cy}
        r={188}
        fill="none"
        stroke="#FFD700"
        strokeWidth="0.8"
        opacity="0.45"
        filter="url(#outer-ring-glow)"
      />
      <circle
        cx={cx}
        cy={cy}
        r={184}
        fill="none"
        stroke="#42A5F5"
        strokeWidth="0.4"
        opacity="0.30"
      />

      {/* ── Main wheel group with dual glow ── */}
      <g filter="url(#zodiac-glow)">
        {/* Decorative outer trim — bright gold */}
        <circle
          cx={cx}
          cy={cy}
          r={outerDecorR}
          fill="none"
          stroke="#FFD700"
          strokeWidth="0.7"
          opacity="0.60"
        />

        {/* Primary outer ring — luminous gold */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#FFC107"
          strokeWidth="2.0"
          opacity="0.95"
        />

        {/* Secondary outer ring — blue shimmer inside gold */}
        <circle
          cx={cx}
          cy={cy}
          r={r - 3}
          fill="none"
          stroke="#42A5F5"
          strokeWidth="0.5"
          opacity="0.35"
        />

        {/* Mid ring — transitional indigo-blue */}
        <circle
          cx={cx}
          cy={cy}
          r={midR}
          fill="none"
          stroke="#1565C0"
          strokeWidth="0.8"
          opacity="0.65"
        />

        {/* Inner ring — deep royal blue */}
        <circle
          cx={cx}
          cy={cy}
          r={innerR}
          fill="none"
          stroke="#0d47a1"
          strokeWidth="1.2"
          opacity="0.80"
        />

        {/* Inner gold accent ring */}
        <circle
          cx={cx}
          cy={cy}
          r={innerR + 3}
          fill="none"
          stroke="#FFD700"
          strokeWidth="0.4"
          opacity="0.40"
        />

        {/* Core rings — deep blue */}
        <circle
          cx={cx}
          cy={cy}
          r={92}
          fill="none"
          stroke="#1565C0"
          strokeWidth="0.8"
          opacity="0.60"
        />
        <circle
          cx={cx}
          cy={cy}
          r={58}
          fill="none"
          stroke="#0d47a1"
          strokeWidth="0.6"
          opacity="0.55"
        />
        <circle
          cx={cx}
          cy={cy}
          r={24}
          fill="none"
          stroke="#1565C0"
          strokeWidth="0.7"
          opacity="0.50"
        />

        {/* ── Segment fills — alternating royal blue / warm gold ── */}
        {ZODIAC_SIGNS.map(({ symbol }, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const nextAngle = ((i + 1) * 30 - 90) * (Math.PI / 180);

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

          // Even = royal blue, odd = warm gold
          const fillColor = i % 2 === 0 ? "#1565C0" : "#FFD700";
          const fillOpacity = i % 2 === 0 ? 0.12 : 0.07;

          return (
            <path
              key={`fill-${symbol}`}
              d={segPath}
              fill={fillColor}
              opacity={fillOpacity}
            />
          );
        })}

        {/* ── Spokes, symbols, and Devanagari names ── */}
        {ZODIAC_SIGNS.map(({ symbol, name }, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const nextAngle = ((i + 1) * 30 - 90) * (Math.PI / 180);
          const midAngle = angle + 15 * (Math.PI / 180);

          // Spoke: inner ring → outer ring
          const x1 = cx + innerR * Math.cos(angle);
          const y1 = cy + innerR * Math.sin(angle);
          const x2 = cx + r * Math.cos(angle);
          const y2 = cy + r * Math.sin(angle);

          // Diamond marker at outer ring spoke junction
          const dx = cx + r * Math.cos(angle);
          const dy = cy + r * Math.sin(angle);
          const ds = 3.0;

          // Symbol position in outer band
          const sx = cx + symbolR * Math.cos(midAngle);
          const sy = cy + symbolR * Math.sin(midAngle);

          // Name position in inner band
          const nx = cx + nameR * Math.cos(midAngle);
          const ny = cy + nameR * Math.sin(midAngle);

          // Tangent rotation for Devanagari text
          const rotDeg = (i * 30 - 90 + 15) % 360;

          // Arc segment border
          const arcX1 = cx + r * Math.cos(angle);
          const arcY1 = cy + r * Math.sin(angle);
          const arcX2 = cx + r * Math.cos(nextAngle);
          const arcY2 = cy + r * Math.sin(nextAngle);

          // Diamond shape at spoke/outer-ring junction
          const spokeDeg = i * 30 - 90;
          const diamondPath = `
            M ${dx + ds * Math.cos(((spokeDeg - 90) * Math.PI) / 180)} ${dy + ds * Math.sin(((spokeDeg - 90) * Math.PI) / 180)}
            L ${dx + ds * Math.cos((spokeDeg * Math.PI) / 180)} ${dy + ds * Math.sin((spokeDeg * Math.PI) / 180)}
            L ${dx + ds * Math.cos(((spokeDeg + 90) * Math.PI) / 180)} ${dy + ds * Math.sin(((spokeDeg + 90) * Math.PI) / 180)}
            L ${dx + ds * Math.cos(((spokeDeg + 180) * Math.PI) / 180)} ${dy + ds * Math.sin(((spokeDeg + 180) * Math.PI) / 180)}
            Z
          `;

          // Spokes: even = deep blue, odd = warm gold
          const spokeColor = i % 2 === 0 ? "#42A5F5" : "#FFD700";
          const spokeOpacity = i % 2 === 0 ? 0.55 : 0.8;

          return (
            <g key={symbol}>
              {/* Spoke line — golden with blue shadow on even */}
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={spokeColor}
                strokeWidth="0.9"
                opacity={spokeOpacity}
                filter="url(#spoke-glow)"
              />
              {/* Arc segment border — gleaming gold */}
              <path
                d={`M ${arcX1} ${arcY1} A ${r} ${r} 0 0 1 ${arcX2} ${arcY2}`}
                fill="none"
                stroke="#FFD700"
                strokeWidth="0.7"
                opacity="0.60"
              />
              {/* Diamond marker — bright gold over blue shimmer */}
              <path d={diamondPath} fill="#42A5F5" opacity="0.50" />
              <path d={diamondPath} fill="#FFE066" opacity="0.98" />
              <path d={diamondPath} fill="#FFF8DC" opacity="0.60" />

              {/* Zodiac symbol — warm brilliant gold */}
              <text
                x={sx}
                y={sy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="12"
                fill="#FFD700"
                opacity="0.98"
              >
                {symbol}
              </text>

              {/* Devanagari zodiac name — glowing gold radiance */}
              <text
                x={nx}
                y={ny}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="10"
                fill="#FFF8C0"
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

        {/* ── Center hub — deep indigo-blue with golden core ── */}
        {/* Outer indigo radiance */}
        <circle
          cx={cx}
          cy={cy}
          r={16}
          fill="#0d47a1"
          opacity="0.90"
          filter="url(#blue-core-glow)"
        />
        {/* Mid blue ring */}
        <circle
          cx={cx}
          cy={cy}
          r={11}
          fill="#1565C0"
          opacity="0.85"
          filter="url(#blue-core-glow)"
        />
        {/* Inner blue core */}
        <circle cx={cx} cy={cy} r={7} fill="#0d47a1" opacity="0.95" />
        {/* Gold fringe ring */}
        <circle
          cx={cx}
          cy={cy}
          r={7.5}
          fill="none"
          stroke="#FFD700"
          strokeWidth="1.0"
          opacity="0.90"
        />
        {/* Bright gold center dot */}
        <circle cx={cx} cy={cy} r={4} fill="#FFD700" opacity="1.0" />
        {/* Pure white core point */}
        <circle cx={cx} cy={cy} r={1.8} fill="#FFFDE7" opacity="1.0" />

        {/* Center starburst rays — alternating gold and blue */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const a = deg * (Math.PI / 180);
          const isCardinal = deg % 90 === 0;
          return (
            <line
              key={deg}
              x1={cx + 6 * Math.cos(a)}
              y1={cy + 6 * Math.sin(a)}
              x2={cx + (isCardinal ? 26 : 20) * Math.cos(a)}
              y2={cy + (isCardinal ? 26 : 20) * Math.sin(a)}
              stroke={isCardinal ? "#FFD700" : "#42A5F5"}
              strokeWidth={isCardinal ? "1.2" : "0.7"}
              opacity={isCardinal ? "0.95" : "0.65"}
            />
          );
        })}

        {/* ── Decorative dot band — alternating gold / blue ── */}
        {Array.from({ length: 24 }, (_, i) => {
          const deg = i * 15;
          const a = (deg * Math.PI) / 180;
          const dotR = i % 3 === 0 ? 107 : 105;
          const x = cx + dotR * Math.cos(a);
          const y = cy + dotR * Math.sin(a);
          const isGold = i % 2 === 0;
          return (
            <circle
              key={`dot-${deg}`}
              cx={x}
              cy={y}
              r={i % 4 === 0 ? 2.2 : 1.3}
              fill={isGold ? "#FFD700" : "#42A5F5"}
              opacity={i % 4 === 0 ? 0.95 : 0.7}
            />
          );
        })}
      </g>

      {/* ── Outer golden rim highlight — rendered on top ── */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#FFD700"
        strokeWidth="0.8"
        opacity="0.55"
        filter="url(#outer-ring-glow)"
      />

      {/* ── Blue aura fringe just inside gold rim ── */}
      <circle
        cx={cx}
        cy={cy}
        r={r - 2}
        fill="none"
        stroke="#1565C0"
        strokeWidth="0.4"
        opacity="0.35"
        filter="url(#blue-core-glow)"
      />
    </svg>
  );
}
