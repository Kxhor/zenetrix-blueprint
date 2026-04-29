import { createFileRoute, Link } from "@tanstack/react-router";
import { RefreshCcw, ShieldCheck, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WalletPageHeader } from "./_wallet";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_wallet/rekyc")({
  component: ReKyc,
});

function ReKyc() {
  const lastDone = new Date(Date.now() - 14 * 86400000).toISOString();
  const nextDue = new Date(Date.now() + 351 * 86400000).toISOString();
  const progress = 14 / 365;

  return (
    <div className="space-y-6 pb-2">
      <WalletPageHeader title="Re-KYC" subtitle="Keep your verification fresh." />
      <div className="px-5">
        <div className="relative overflow-hidden rounded-3xl border bg-card p-6 shadow-card">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent/10 blur-2xl" />
          <div className="flex items-center gap-5">
            <div className="relative h-24 w-24">
              <svg viewBox="0 0 100 100" className="-rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke="oklch(0.92 0.008 250)"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke="oklch(0.62 0.16 148)"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 44}
                  strokeDashoffset={2 * Math.PI * 44 * (1 - progress)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <ShieldCheck className="h-7 w-7 text-success" />
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Status</p>
              <p className="font-display text-xl font-semibold">All up to date</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Last verified {formatDate(lastDone)}
              </p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-muted/50 p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Last completed
              </p>
              <p className="mt-0.5 text-sm font-medium">{formatDate(lastDone)}</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Next due</p>
              <p className="mt-0.5 text-sm font-medium">{formatDate(nextDue)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Why re-KYC?
        </h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            Required by RBI for high-risk accounts every 2 years.
          </li>
          <li className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            Keeps your address and identity records current.
          </li>
        </ul>
      </div>

      <div className="px-5">
        <Button asChild size="lg" className="h-12 w-full rounded-full text-base">
          <Link to="/onboarding/start">
            <RefreshCcw className="mr-1 h-4 w-4" /> Start re-KYC now{" "}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
