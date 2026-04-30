import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CredentialCard } from "@/components/credential-card";
import { mockCredentials } from "@/mocks/fixtures";
import { useOnboardingStore } from "@/stores/onboarding-store";

export const Route = createFileRoute("/_wallet/onboarding/success")({
  component: OnboardingSuccess,
});

function OnboardingSuccess() {
  const reset = useOnboardingStore((s) => s.reset);
  useEffect(() => () => reset(), [reset]);

  return (
    <div className="relative overflow-hidden pb-12">
      <div
        className="absolute inset-x-0 top-0 h-72 bg-gradient-to-br from-primary/20 via-accent/20 to-primary-glow/20 opacity-70"
        aria-hidden
      />
      <div className="relative px-5 pt-10 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success ring-8 ring-success/5"
        >
          <Sparkles className="h-7 w-7" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-5 font-display text-3xl font-semibold tracking-tight"
        >
          You're verified.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-2 text-muted-foreground"
        >
          Your Verified KYC credential is now in your wallet.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, rotate: -2 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mx-5 mt-8"
      >
        <CredentialCard credential={mockCredentials[0]} />
      </motion.div>

      <div className="mx-5 mt-8 space-y-2">
        <Button asChild size="lg" className="h-12 w-full rounded-full text-base">
          <Link to="/wallet">
            Open wallet <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="ghost" className="h-11 w-full">
          <Link to="/consent">Review pending consent requests</Link>
        </Button>
      </div>

      {/* Confetti */}
      <Confetti />
    </div>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 24 });
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((_, i) => {
        const colors = ["bg-accent", "bg-success", "bg-warning", "bg-primary", "bg-primary-glow"];
        const c = colors[i % colors.length];
        const left = (i * 137) % 100;
        const delay = (i % 8) * 0.1;
        const dur = 2.5 + ((i * 13) % 10) / 10;
        return (
          <motion.span
            key={i}
            initial={{ y: -30, opacity: 0, rotate: 0 }}
            animate={{ y: 600, opacity: [0, 1, 1, 0], rotate: 360 }}
            transition={{ delay, duration: dur, ease: "linear" }}
            className={`absolute top-0 h-2 w-1.5 rounded-sm ${c}`}
            style={{ left: `${left}%` }}
          />
        );
      })}
    </div>
  );
}
