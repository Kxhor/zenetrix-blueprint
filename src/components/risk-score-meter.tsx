import { useId } from "react";
import { cn } from "@/lib/utils";
import { riskBand } from "@/lib/format";

export function RiskScoreMeter({
  score,
  size = 180,
  strokeWidth = 14,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
}) {
  const uid = useId();
  const gradId = `rsm-g-${uid.replace(/:/g, "")}`;
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const offset = c * (1 - pct * 0.75); // 270deg arc
  const band = riskBand(score);
  const tone =
    band === "low" ? "text-success" : band === "medium" ? "text-warning" : "text-destructive";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={cn("rotate-[135deg]", tone)}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="oklch(0.62 0.16 148)" />
            <stop offset="0.5" stopColor="oklch(0.78 0.15 75)" />
            <stop offset="1" stopColor="oklch(0.6 0.22 27)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="oklch(0.92 0.008 250)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${c * 0.75} ${c}`}
          strokeLinecap="round"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-display text-4xl font-semibold tabular-nums", tone)}>
          {Math.round(score)}
        </span>
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {band} risk
        </span>
      </div>
    </div>
  );
}
