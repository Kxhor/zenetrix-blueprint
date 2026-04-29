import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ShieldCheck, Plus, RefreshCcw } from "lucide-react";
import { api } from "@/lib/api-client";
import { CredentialCard } from "@/components/credential-card";
import { WalletPageHeader } from "./_wallet";
import { Button } from "@/components/ui/button";
import { SkeletonCard } from "@/components/skeletons";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_wallet/wallet")({
  component: WalletPage,
});

function WalletPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["credentials"],
    queryFn: api.listCredentials,
  });
  const { data: consents } = useQuery({ queryKey: ["consents"], queryFn: api.listConsents });
  const pending = consents?.filter((c) => c.status === "pending").length ?? 0;

  const primary = data?.find((c) => c.type === "kyc-full");
  const others = data?.filter((c) => c.id !== primary?.id) ?? [];

  return (
    <div className="space-y-6">
      <WalletPageHeader title="Your wallet" subtitle="Verified credentials at your fingertips." />

      {/* Greeting + quick stats */}
      <div className="px-5">
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Credentials" value={String(data?.length ?? 0)} />
          <Stat
            label="Active grants"
            value={String(consents?.filter((c) => c.status === "active").length ?? 0)}
          />
          <Stat label="Pending" value={String(pending)} highlight={pending > 0} />
        </div>
      </div>

      {/* Hero card */}
      <div className="px-5">
        {isLoading || !primary ? (
          <SkeletonCard className="aspect-[1.66/1]" />
        ) : (
          <CredentialCard credential={primary} to={`/wallet/credential/${primary.id}`} />
        )}
        <div className="mt-3 flex items-center justify-between">
          <Link
            to="/rekyc"
            className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
          >
            <RefreshCcw className="h-3.5 w-3.5" /> Re-KYC
          </Link>
          {primary && (
            <p className="text-xs text-muted-foreground">
              Issued {formatDate(primary.issuedAt)} · valid till {formatDate(primary.expiresAt)}
            </p>
          )}
        </div>
      </div>

      {/* Pending consent banner */}
      {pending > 0 && (
        <Link
          to="/consent"
          className="mx-5 flex items-center justify-between gap-3 rounded-2xl border bg-card p-4 shadow-card transition hover:shadow-elegant"
        >
          <div className="flex items-center gap-3">
            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <ShieldCheck className="h-4 w-4" />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-pulse rounded-full bg-accent ring-2 ring-card" />
            </span>
            <div>
              <p className="text-sm font-semibold">
                {pending} pending consent {pending === 1 ? "request" : "requests"}
              </p>
              <p className="text-xs text-muted-foreground">Review before they expire</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      )}

      {/* Other credentials */}
      <div className="px-5 pb-2">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold tracking-tight">Other credentials</h2>
          <Button variant="ghost" size="sm" className="h-8 gap-1 text-accent">
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        </div>
        <div className="space-y-3">
          {others.map((c) => (
            <Link
              key={c.id}
              to="/wallet/credential/$id"
              params={{ id: c.id }}
              className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-4 transition hover:shadow-card"
            >
              <div>
                <p className="text-sm font-semibold">{c.title}</p>
                <p className="font-mono text-xs text-muted-foreground">{c.serial}</p>
              </div>
              <StatusBadge tone={c.status === "active" ? "success" : "muted"}>
                {c.status}
              </StatusBadge>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-xl border bg-card p-3 shadow-xs">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-1 font-display text-xl font-semibold tabular-nums ${highlight ? "text-accent" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}
