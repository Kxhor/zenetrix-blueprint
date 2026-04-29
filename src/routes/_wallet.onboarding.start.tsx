import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Fingerprint, FileText, ScanFace, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnboardingProgress } from "@/components/onboarding-progress";

export const Route = createFileRoute("/_wallet/onboarding/start")({
  component: OnboardingStart,
});

function OnboardingStart() {
  return (
    <div className="pb-12">
      <OnboardingProgress current="start" />
      <div className="px-5 pt-6">
        <span className="inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-0.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-3 w-3 text-success" /> Takes about 60 seconds
        </span>
        <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight">
          Let's set up your<br />verified identity.
        </h1>
        <p className="mt-2 text-muted-foreground">
          We'll verify a few documents and a quick liveness check. Your data stays encrypted on
          your device.
        </p>

        <ul className="mt-7 space-y-3">
          {[
            { icon: FileText, title: "Identity documents", body: "Aadhaar and PAN. Optional address proof." },
            { icon: ScanFace, title: "Quick liveness check", body: "Look at the camera, blink, turn — we'll guide you." },
            { icon: Fingerprint, title: "Issue your credential", body: "Stored only in your wallet. Share when you choose to." },
          ].map((s, i) => (
            <motion.li
              key={s.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.05 }}
              className="flex items-start gap-3 rounded-2xl border bg-card p-4 shadow-card"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">{s.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{s.body}</p>
              </div>
            </motion.li>
          ))}
        </ul>

        <Button asChild size="lg" className="mt-8 h-12 w-full rounded-full text-base">
          <Link to="/onboarding/identity">
            Start verification <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          By continuing you agree to Zenetrix's data handling under DPDP 2023.
        </p>
      </div>
    </div>
  );
}
