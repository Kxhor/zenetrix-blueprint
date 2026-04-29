import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useId } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function AnimatedNumber({
  value,
  decimals = 0,
  suffix,
  prefix,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
}) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 90, damping: 18, mass: 0.9 });
  const display = useTransform(spring, (v) => {
    const n = decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString("en-IN");
    return `${prefix ?? ""}${n}${suffix ?? ""}`;
  });
  useEffect(() => {
    mv.set(value);
  }, [mv, value]);
  return <motion.span>{display}</motion.span>;
}

export function KpiTile({
  label,
  value,
  delta,
  decimals = 0,
  suffix,
  prefix,
  spark,
  invertDelta,
}: {
  label: string;
  value: number;
  delta?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  spark?: number[];
  invertDelta?: boolean;
}) {
  const positive = (delta ?? 0) >= 0;
  const goodPositive = invertDelta ? !positive : positive;
  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-card transition-shadow hover:shadow-elegant">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        {typeof delta === "number" && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium",
              goodPositive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
            )}
          >
            {positive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="mt-3 font-display text-3xl font-semibold tabular-nums tracking-tight">
        <AnimatedNumber value={value} decimals={decimals} suffix={suffix} prefix={prefix} />
      </div>
      {spark && spark.length > 0 && <Sparkline values={spark} className="mt-3" />}
    </div>
  );
}

function Sparkline({ values, className }: { values: number[]; className?: string }) {
  const uid = useId();
  const gradId = `sl-g-${uid.replace(/:/g, "")}`;
  const w = 120;
  const h = 28;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={cn("h-7 w-full text-accent", className)}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.35" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.5" />
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#${gradId})`} />
    </svg>
  );
}
