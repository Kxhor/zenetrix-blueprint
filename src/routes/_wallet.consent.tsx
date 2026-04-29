import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, ArrowRight, Clock, ShieldCheck } from "lucide-react";
import { api } from "@/mocks/api";
import { WalletPageHeader } from "./_wallet";
import { StatusBadge } from "@/components/status-badge";
import { SkeletonRow } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_wallet/consent")({
  component: ConsentPage,
});

function ConsentPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["consents"], queryFn: api.listConsents });
  const respond = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "approve" | "reject" }) =>
      api.respondConsent(id, action),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["consents"] });
      toast.success(vars.action === "approve" ? "Consent approved" : "Request rejected");
    },
  });

  const pending = data?.filter((c) => c.status === "pending") ?? [];
  const active = data?.filter((c) => c.status === "active") ?? [];

  return (
    <div className="space-y-6 pb-2">
      <WalletPageHeader title="Consent" subtitle="Approve, review and revoke data sharing." />

      <div className="px-5">
        <div className="flex gap-2 text-xs">
          <Link
            to="/consent"
            className="rounded-full bg-primary/8 px-3 py-1.5 font-medium text-primary"
          >
            Pending ({pending.length})
          </Link>
          <Link
            to="/consent/active"
            className="rounded-full px-3 py-1.5 font-medium text-muted-foreground hover:bg-muted"
          >
            Active ({active.length})
          </Link>
        </div>
      </div>

      <div className="space-y-3 px-5">
        {isLoading && <><SkeletonRow /><SkeletonRow /></>}
        {!isLoading && pending.length === 0 && (
          <div className="rounded-2xl border bg-card p-8 text-center shadow-card">
            <ShieldCheck className="mx-auto h-7 w-7 text-success" />
            <p className="mt-3 text-sm font-medium">No pending requests</p>
            <p className="mt-1 text-xs text-muted-foreground">You'll see new consent requests here.</p>
          </div>
        )}
        {pending.map((c) => (
          <div key={c.id} className="rounded-2xl border bg-card p-4 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <Link to="/consent/$id" params={{ id: c.id }} className="flex flex-1 items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{c.institution}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{c.purpose}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {c.scope.slice(0, 3).map((s) => (
                      <span key={s} className="rounded-full border bg-background px-2 py-0.5 text-[10px] text-muted-foreground">
                        {s}
                      </span>
                    ))}
                    {c.scope.length > 3 && (
                      <span className="text-[10px] text-muted-foreground">+{c.scope.length - 3}</span>
                    )}
                  </div>
                </div>
              </Link>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" /> Asked {formatRelativeTime(c.requestedAt)} · {c.duration}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => respond.mutate({ id: c.id, action: "reject" })}
              >
                Reject
              </Button>
              <Button size="sm" onClick={() => respond.mutate({ id: c.id, action: "approve" })}>
                Approve
              </Button>
            </div>
          </div>
        ))}
      </div>

      {active.length > 0 && (
        <div className="px-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Active grants
          </h2>
          <div className="space-y-2">
            {active.slice(0, 3).map((c) => (
              <Link
                key={c.id}
                to="/consent/$id"
                params={{ id: c.id }}
                className="flex items-center justify-between rounded-2xl border bg-card p-3 transition hover:shadow-card"
              >
                <div>
                  <p className="text-sm font-semibold">{c.institution}</p>
                  <p className="text-xs text-muted-foreground">{c.purpose}</p>
                </div>
                <StatusBadge tone="success">Active</StatusBadge>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
