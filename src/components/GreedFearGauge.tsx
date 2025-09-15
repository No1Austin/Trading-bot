export default function GreedFearGauge({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  const pct = v / 100;

  const size = 240;
  const r = 90;            // radius
  const stroke = 18;
  const C = 2 * Math.PI * r; // circumference

  // Arc lengths
  const greenLen = C * pct;         // how much of the circle is green
  const redLen   = C * (1 - pct);   // the remainder is red

  return (
    <svg width={size} height={size} className="drop-shadow-lg">
      {/* Base ring */}
      <circle cx={size/2} cy={size/2} r={r} stroke="#111" strokeWidth={stroke} fill="none" />

      {/* GREEN arc = first segment */}
      <circle
        cx={size/2}
        cy={size/2}
        r={r}
        strokeDasharray={`${greenLen} ${C}`} // visible length then gap
        strokeDashoffset={0}                 // start at top (after rotate)
        stroke="#22c55e"
        strokeWidth={stroke}
        strokeLinecap="butt"
        fill="none"
        transform={`rotate(-90 ${size/2} ${size/2})`}
      />

      {/* RED arc = immediately after green */}
      <circle
        cx={size/2}
        cy={size/2}
        r={r}
        strokeDasharray={`${redLen} ${C}`}
        strokeDashoffset={-greenLen}         // start where green ends
        stroke="#ef4444"
        strokeWidth={stroke}
        strokeLinecap="butt"
        fill="none"
        transform={`rotate(-90 ${size/2} ${size/2})`}
      />

      {/* Label */}
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
            fontSize="42" fontWeight="bold" fill={v >= 50 ? "#22c55e" : "#ef4444"}>
        {Math.round(v)}
      </text>
      <text x="50%" y="65%" textAnchor="middle" fontSize="16" fill="#9ca3af">
        {v >= 50 ? "Greed" : "Fear"}
      </text>
    </svg>
  );
}
