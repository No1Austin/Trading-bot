type Props = {
  value: number;
  /** Optional wrapper classes to control size/placement */
  className?: string;
};

export default function GreedFearGauge({ value, className }: Props) {
  const v = Math.max(0, Math.min(100, value));
  const pct = v / 100;

  // Fixed internal coordinate system; scales via viewBox
  const size = 240;
  const r = 90;
  const stroke = 18;
  const C = 2 * Math.PI * r;

  const greenLen = C * pct;
  const redLen = C * (1 - pct);

  const label = v >= 50 ? "Greed" : "Fear";
  const color = v >= 50 ? "#22c55e" : "#ef4444";

  return (
    <div
      className={`mx-auto aspect-square w-36 sm:w-52 md:w-60 ${className ?? ""}`}
      role="img"
      aria-label={`Greed & Fear gauge: ${Math.round(v)} (${label})`}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        className="drop-shadow-lg"
      >
        <title>Greed &amp; Fear Gauge</title>
        <desc>
          Circular gauge showing market sentiment. {Math.round(v)} out of 100 indicating {label}.
        </desc>

        {/* Base ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#111"
          strokeWidth={stroke}
          fill="none"
        />

        {/* GREEN arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeDasharray={`${greenLen} ${C}`}
          strokeDashoffset={0}
          stroke="#22c55e"
          strokeWidth={stroke}
          strokeLinecap="butt"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />

        {/* RED arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeDasharray={`${redLen} ${C}`}
          strokeDashoffset={-greenLen}
          stroke="#ef4444"
          strokeWidth={stroke}
          strokeLinecap="butt"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />

        {/* Labels (scale with SVG) */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="42"
          fontWeight="bold"
          fill={color}
        >
          {Math.round(v)}
        </text>
        <text x="50%" y="65%" textAnchor="middle" fontSize="16" fill="#9ca3af">
          {label}
        </text>
      </svg>
    </div>
  );
}
