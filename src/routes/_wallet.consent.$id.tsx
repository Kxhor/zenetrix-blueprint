import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, ShieldCheck } from "lucide-react";
import { api } from "@/mocks/api";
import { WalletPageHeader } from "./_wallet";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/skeletons";
import { formatDate, formatRelativeTime } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_wallet/consent/$id")({
  component: ConsentDetail,
});

function ConsentDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["consent", id],
    queryFn: () => api.getConsent(id),
  });
  const respond = useMutation({
    mutationFn: (action: "approve" | "reject" | "revoke") => api.respondConsent(id, action),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["consents"] });
      qc.invalidateQueries({ queryKey: ["consent", id] });
      toast.success("Updated");
    },
  });

  if (isLoading) return <PageLoader />;
  if (!data) {
    return (
      <div className="px-5 py-10 text-center">
        <p className="text-muted-foreground">Request not found.</p>
        <Link to="/consent" className="mt-3 inline-block text-accent">Back</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-2">
      <WalletPageHeader title={data.institution} subtitle={data.purpose} back="/consent" />

      <div className="px-5">
        <div className="rounded-2xl border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/8 text-primary">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{data.institutionType}</p>
                <p className="text-base font-semibold">{data.institution}</p>
              </div>
            </div>
            <StatusBadge tone={data.status === "active" ? "success" : data.status === "pending" ? "info" : "muted"}>
              {data.status}
            </StatusBadge>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <Info label="Requested" value={formatRelativeTime(data.requestedAt)} />
            <Info label="Duration" value={data.duration} />
            <Info label="Expires" value={formatDate(data.expiresAt)} />
            <Info label="ID" value={data.id} mono />
          </div>
        </div>
      </div>

      <div className="px-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Data they will see
        </h2>
        <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
          {data.scope.map((s, i) => (
            <div key={s} className={`flex items-center gap-2.5 px-4 py-3 ${i > 0 ? "border-t" : ""}`}>
              <ShieldCheck className="h-4 w-4 text-success" />
              <span className="text-sm">{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 px-5">
        {data.status === "pending" ? (
          <>
            <Button variant="outline" onClick={() => respond.mutate("reject")}>Reject</Button>
            <Button onClick={() => respond.mutate("approve")}>Approve</Button>
          </>
        ) : data.status === "active" ? (
          <Button
            variant="outline"
            className="col-span-2 text-destructive hover:bg-destructive/5 hover:text-destructive"
            onClick={() => respond.mutate("revoke")}
          >
            Revoke access
          </Button>
        ) : (
          <Button asChild variant="outline" className="col-span-2">
            <Link to="/consent">Back to consent</Link>
          </Button>
        )}
      </div>
    </div>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl bg-muted/50 p-2.5">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-0.5 text-sm font-medium ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
