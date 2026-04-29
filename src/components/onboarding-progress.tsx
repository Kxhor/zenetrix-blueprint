import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = ["start", "identity", "liveness", "review", "success"] as const;
type Step = (typeof steps)[number];

const labels: Record<Step, string> = {
  start: "Get started",
  identity: "Identity",
  liveness: "Liveness",
  review: "Review",
  success: "Done",
};

export function OnboardingProgress({ current, back }: { current: Step; back?: string }) {
  const idx = steps.indexOf(current);
  const pct = ((idx + 1) / steps.length) * 100;
  return (
    <div className="sticky top-14 z-20 border-b bg-background/85 backdrop-blur-md">
      <div className="px-5 pb-3 pt-3">
        <div className="flex items-center justify-between text-xs">
          <Link
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            to={(back ?? "/wallet") as any}
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Back
          </Link>
          <span className="font-medium tabular-nums text-muted-foreground">
            Step {idx + 1} of {steps.length}
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary via-primary-glow to-accent transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-2 grid grid-cols-5 text-[10px] uppercase tracking-wider">
          {steps.map((s, i) => (
            <span
              key={s}
              className={cn(
                "text-center",
                i <= idx ? "text-foreground font-medium" : "text-muted-foreground/60",
              )}
            >
              {labels[s]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
