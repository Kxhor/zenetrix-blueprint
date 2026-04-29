import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Fingerprint,
  Eye,
  Wallet,
  ArrowRight,
  Lock,
  Building2,
  CheckCircle2,
  Sparkles,
  Globe2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ZenetrixWordmark, ZenetrixMark } from "@/components/brand";
import { GradientMesh } from "@/components/gradient-mesh";
import { CredentialCard } from "@/components/credential-card";
import { mockCredentials } from "@/mocks/fixtures";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zenetrix — Trusted financial identity, instantly verifiable" },
      {
        name: "description",
        content:
          "Issue, hold and share KYC credentials with bank-grade security. Built for regulated Indian financial services.",
      },
      { property: "og:title", content: "Zenetrix" },
      { property: "og:description", content: "Trusted financial identity, instantly verifiable." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="sticky top-0 z-30 glass-strong border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <ZenetrixWordmark />
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#how" className="hover:text-foreground">
              How it works
            </a>
            <a href="#network" className="hover:text-foreground">
              Network
            </a>
            <a href="#trust" className="hover:text-foreground">
              Trust
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/admin/login">Analyst sign in</Link>
            </Button>
            <Button asChild size="sm" className="rounded-full">
              <Link to="/login">
                Get started <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <GradientMesh intensity="default" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 pb-12 pt-16 md:grid-cols-2 md:gap-12 md:pt-24 lg:gap-16 lg:pb-24">
          <div className="flex flex-col justify-center">
            <motion.span
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex w-fit items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
              RBI-aligned · DPDP-ready · v-KYC compatible
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl"
            >
              Trusted financial identity,
              <br />
              <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                instantly verifiable.
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-5 max-w-xl text-pretty text-lg text-muted-foreground"
            >
              Zenetrix issues portable KYC credentials backed by liveness, document authentication
              and consent ledger. Your customers verify in 60 seconds — you stay regulator-ready.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-7 flex flex-wrap items-center gap-3"
            >
              <Button asChild size="lg" className="rounded-full">
                <Link to="/register">
                  Get verified <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <Link to="/admin/login">Analyst console</Link>
              </Button>
            </motion.div>

            <div className="mt-10 grid grid-cols-3 gap-6 border-t pt-6">
              <Stat label="Avg verification" value="58s" />
              <Stat label="Approval lift" value="+27%" />
              <Stat label="Partner institutions" value="120+" />
            </div>
          </div>

          {/* Hero credential mock */}
          <div className="relative flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 24, rotate: -3 }}
              animate={{ opacity: 1, y: 0, rotate: -3 }}
              transition={{ delay: 0.1, duration: 0.7 }}
              className="absolute left-2 top-6 w-[80%] max-w-md opacity-70 blur-[1px]"
            >
              <CredentialCard credential={mockCredentials[1]} showShimmer={false} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="relative w-full max-w-md animate-float"
            >
              <CredentialCard credential={mockCredentials[0]} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section id="trust" className="border-y bg-muted/40">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-5 py-7 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {["RBI · v-KYC", "DPDP 2023", "ISO 27001", "SOC 2 Type II", "AA Sahamati"].map((t) => (
            <span key={t} className="flex items-center gap-2">
              <span className="inline-block h-1 w-1 rounded-full bg-foreground/30" />
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-7xl px-5 py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
            How it works
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            One identity, anywhere your customer transacts.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Customers complete KYC once. Banks, brokers, NBFCs and insurers verify on demand — with
            full consent and a tamper-evident audit trail.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            {
              icon: Fingerprint,
              title: "Onboard in 60 seconds",
              body: "Aadhaar, PAN, address, liveness — all in one wizard with guided steps.",
            },
            {
              icon: Wallet,
              title: "Hold credentials in a wallet",
              body: "Verifiable credentials live on the customer's device, not a partner's database.",
            },
            {
              icon: Eye,
              title: "Share only what's needed",
              body: "Granular consent. Time-bound scopes. Revocable in one tap.",
            },
          ].map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl border bg-card p-6 shadow-card"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Network */}
      <section id="network" className="mx-auto max-w-7xl px-5 pb-20">
        <div className="overflow-hidden rounded-3xl border bg-card shadow-card">
          <div className="grid gap-10 p-8 md:grid-cols-2 md:p-12">
            <div className="flex flex-col justify-center">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">Network</p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight">
                Built for regulated India.
              </h2>
              <p className="mt-3 max-w-md text-muted-foreground">
                Plug into the Zenetrix network and accept verified credentials from any partner —
                bank, broker, NBFC, insurer, exchange.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  { icon: Building2, label: "Banks & NBFCs" },
                  { icon: Globe2, label: "Brokers & Exchanges" },
                  { icon: ShieldCheck, label: "Insurers" },
                  { icon: Lock, label: "Regulators" },
                ].map((p) => (
                  <div
                    key={p.label}
                    className="flex items-center gap-3 rounded-xl border bg-background p-3"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                      <p.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium">{p.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative min-h-[320px] overflow-hidden rounded-2xl bg-primary text-primary-foreground">
              <GradientMesh intensity="strong" className="opacity-90" />
              <div className="relative grid h-full place-items-center p-8">
                <div className="space-y-4 text-center">
                  <ZenetrixMark className="mx-auto h-12 w-12" />
                  <p className="font-display text-2xl font-semibold">120+ partners</p>
                  <p className="text-sm text-primary-foreground/80">
                    1.2M verified citizens · 4.8M consent transactions
                  </p>
                  <div className="mx-auto flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs ring-1 ring-white/20 backdrop-blur">
                    <Sparkles className="h-3 w-3" /> Live network · Aug 2026
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/40">
        <div className="mx-auto max-w-7xl px-5 py-16 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-success" />
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Ready to verify your customers in 60 seconds?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Try the live demo — full wallet flow and analyst console with realistic mock data.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="rounded-full">
              <Link to="/register">Try the wallet</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link to="/admin/login">Open admin console</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-muted-foreground">
          <ZenetrixWordmark />
          <p>© {new Date().getFullYear()} Zenetrix Identity Network. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-display text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-0.5 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}
