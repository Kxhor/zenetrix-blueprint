import { Link } from "@tanstack/react-router";
import { ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Credential } from "@/lib/api-client";

const typeAccent: Record<Credential["type"], string> = {
  "kyc-full": "from-[oklch(0.32_0.05_248)] via-[oklch(0.28_0.06_258)] to-[oklch(0.42_0.1_235)]",
  "kyc-basic": "from-[oklch(0.4_0.08_258)] via-[oklch(0.35_0.08_245)] to-[oklch(0.55_0.12_215)]",
  "address-proof": "from-[oklch(0.34_0.08_270)] via-[oklch(0.4_0.1_280)] to-[oklch(0.5_0.13_250)]",
  "income-proof": "from-[oklch(0.3_0.08_180)] via-[oklch(0.35_0.1_175)] to-[oklch(0.5_0.13_165)]",
};

/**
 * The hero credential card. Glassmorphism + gradient + holographic shimmer + mono identity number.
 * Used on /wallet, /onboarding/success and credential detail page.
 */
export function CredentialCard({
  credential,
  size = "default",
  to,
  showShimmer = true,
}: {
  credential: Credential;
  size?: "default" | "compact" | "lg";
  to?: string;
  showShimmer?: boolean;
}) {
  const expired = credential.status === "expired";
  const revoked = credential.status === "revoked";

  const inner = (
    <div
      className={cn(
        "group relative overflow-hidden rounded-3xl text-primary-foreground",
        "shadow-elegant ring-1 ring-white/10 transition-transform duration-500",
        "hover:-translate-y-0.5 active:translate-y-0",
        size === "compact"
          ? "aspect-[1.78/1]"
          : size === "lg"
            ? "aspect-[1.62/1]"
            : "aspect-[1.66/1]",
      )}
    >
      {/* Base gradient */}
      <div className={cn("absolute inset-0 bg-gradient-to-br", typeAccent[credential.type])} />
      {/* Glow */}
      <div
        aria-hidden
        className="absolute -inset-x-10 -top-20 h-40 rounded-full blur-3xl opacity-60"
        style={{
          background: "radial-gradient(closest-side, oklch(0.78 0.16 220 / 0.55), transparent 70%)",
        }}
      />
      {/* Holographic shimmer */}
      {showShimmer && (
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 holo-shimmer opacity-50 mix-blend-overlay",
            "[mask-image:linear-gradient(135deg,transparent,white_30%,white_70%,transparent)]",
          )}
        />
      )}
      {/* Subtle grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative flex h-full flex-col justify-between p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/70">
              {credential.issuer}
            </p>
            <h3 className="font-display text-lg font-semibold leading-tight sm:text-xl">
              {credential.title}
            </h3>
          </div>
          <div className="rounded-full bg-white/15 p-2 backdrop-blur-md ring-1 ring-white/20">
            {credential.type === "kyc-full" || credential.type === "kyc-basic" ? (
              <ShieldCheck className="h-4 w-4" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </div>
        </div>

        <div>
          <p className="font-mono text-sm tracking-[0.2em] text-white/85 sm:text-base">
            {credential.serial}
          </p>
          <div className="mt-3 flex items-end justify-between">
            <div className="space-y-0.5">
              <p className="text-[10px] uppercase tracking-widest text-white/60">Holder</p>
              <p className="text-sm font-medium">Aarav Sharma</p>
            </div>
            <div className="space-y-0.5 text-right">
              <p className="text-[10px] uppercase tracking-widest text-white/60">
                {expired || revoked ? "Status" : "Valid until"}
              </p>
              <p className="text-sm font-medium">
                {expired
                  ? "Expired"
                  : revoked
                    ? "Revoked"
                    : new Date(credential.expiresAt).toLocaleDateString("en-IN", {
                        month: "short",
                        year: "numeric",
                      })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {(expired || revoked) && (
        <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px]" aria-hidden />
      )}
    </div>
  );

  if (to) {
    return (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <Link to={to as any} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}
