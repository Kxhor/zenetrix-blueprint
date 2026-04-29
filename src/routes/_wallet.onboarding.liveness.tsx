import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ScanFace, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnboardingProgress } from "@/components/onboarding-progress";
import { useOnboardingStore } from "@/stores/onboarding-store";

export const Route = createFileRoute("/_wallet/onboarding/liveness")({
  component: OnboardingLiveness,
});

const prompts = [
  "Look straight at the camera",
  "Slowly blink your eyes",
  "Turn your head left, then right",
];

function OnboardingLiveness() {
  const navigate = useNavigate();
  const setLiveness = useOnboardingStore((s) => s.setLivenessScore);
  const [phase, setPhase] = useState<"intro" | "running" | "done">("intro");
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (phase !== "running") return;
    let raf = 0;
    const start = performance.now();
    const total = 4500;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / total);
      setProgress(p);
      const s = Math.min(2, Math.floor(p * 3));
      setStep(s);
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        setPhase("done");
        setLiveness(96);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, setLiveness]);

  return (
    <div className="pb-12">
      <OnboardingProgress current="liveness" back="/onboarding/identity" />
      <div className="px-5 pt-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Liveness check</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          We'll capture a short clip — no recording is stored.
        </p>

        <div className="mt-6 flex flex-col items-center">
          <div className="relative flex h-64 w-64 items-center justify-center">
            {/* Ring */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="oklch(0.92 0.008 250)"
                strokeWidth="4"
              />
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="oklch(0.7 0.14 230)"
                strokeWidth="4"
                strokeDasharray={2 * Math.PI * 46}
                strokeDashoffset={2 * Math.PI * 46 * (1 - progress)}
                strokeLinecap="round"
                className="transition-[stroke-dashoffset] duration-200"
              />
            </svg>
            {/* Avatar */}
            <div
              className={`relative flex h-44 w-44 items-center justify-center rounded-full bg-gradient-to-br from-muted to-card ${phase === "running" ? "animate-pulse-ring" : ""}`}
            >
              <AnimatePresence mode="wait">
                {phase === "done" ? (
                  <motion.div
                    key="done"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-success text-success-foreground"
                  >
                    <CheckCircle2 className="h-10 w-10" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="face"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    <ScanFace className="h-16 w-16 text-muted-foreground" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-6 h-12 text-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={`${phase}-${step}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="text-base font-medium"
              >
                {phase === "intro"
                  ? "Hold your phone at eye level"
                  : phase === "done"
                    ? "Liveness passed · 96% confidence"
                    : prompts[step]}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="mt-6 w-full">
            {phase === "intro" && (
              <Button
                size="lg"
                className="h-12 w-full rounded-full text-base"
                onClick={() => setPhase("running")}
              >
                Start liveness
              </Button>
            )}
            {phase === "running" && (
              <Button size="lg" disabled className="h-12 w-full rounded-full text-base">
                Capturing… {Math.round(progress * 100)}%
              </Button>
            )}
            {phase === "done" && (
              <Button
                size="lg"
                className="h-12 w-full rounded-full text-base"
                onClick={() => navigate({ to: "/onboarding/review" })}
              >
                Continue
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
