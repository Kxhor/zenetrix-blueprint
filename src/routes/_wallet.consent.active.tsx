import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2 } from "lucide-react";
import { api } from "@/mocks/api";
import { WalletPageHeader } from "./_wallet";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { SkeletonRow } from "@/components/skeletons";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_wallet/consent/active")({
  component: ActiveConsents,
});

function ActiveConsents() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["consents"], queryFn: api.listConsents });
  const revoke = useMutation({
    mutationFn: (id: string) => api.respondConsent(id, "revoke"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["consents"] });
      toast.success("Consent revoked");
    },
  });

  const items = data?.filter((c) => c.status === "active" || c.status === "expired" || c.status === "revoked") ?? [];

  return (
    <div className="space-y-6 pb-2">
      <WalletPageHeader title="Active grants" subtitle="Revoke access at any time." back="/consent" />
      <div className="space-y-3 px-5">
        {isLoading && <><SkeletonRow /><SkeletonRow /></>}
        {items.map((c) => (
          <div key={c.id} className="rounded-2xl border bg-card p-4 shadow-card">
            <div className="flex items-start justify-between">
              <Link to="/consent/$id" params={{ id: c.id }} className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/8 text-primary">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{c.institution}</p>
                  <p className="text-xs text-muted-foreground">{c.purpose}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Expires {formatDate(c.expiresAt)}</p>
                </div>
              </Link>
              <StatusBadge tone={c.status === "active" ? "success" : "muted"}>{c.status}</StatusBadge>
            </div>
            {c.status === "active" && (
              <Button
                size="sm"
                variant="outline"
                className="mt-3 w-full text-destructive hover:bg-destructive/5 hover:text-destructive"
                onClick={() => revoke.mutate(c.id)}
              >
                Revoke access
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
