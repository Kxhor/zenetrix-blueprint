import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QrCode, Share2, ShieldCheck, EyeOff, Eye, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api-client";
import { CredentialCard } from "@/components/credential-card";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/skeletons";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/format";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/_wallet/wallet/credential/$id")({
  component: CredentialDetail,
});

function CredentialDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["credential", id],
    queryFn: () => api.getCredential(id),
  });
  const [showSensitive, setShowSensitive] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [revokeOpen, setRevokeOpen] = useState(false);

  const revoke = useMutation({
    mutationFn: () => api.revokeCredential(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["credentials"] });
      qc.invalidateQueries({ queryKey: ["credential", id] });
      toast.success("Credential revoked");
      setRevokeOpen(false);
    },
  });

  if (isLoading) return <PageLoader />;
  if (!data) {
    return (
      <div className="px-5 py-10 text-center">
        <p className="text-muted-foreground">Credential not found.</p>
        <Link to="/wallet" className="mt-3 inline-block text-accent">
          Back to wallet
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="px-5 pt-4">
        <Link
          to="/wallet"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Wallet
        </Link>
      </div>

      <div className="px-5">
        <CredentialCard credential={data} />
      </div>

      <div className="grid grid-cols-2 gap-3 px-5">
        <Button onClick={() => setShareOpen(true)} className="h-11 rounded-full">
          <QrCode className="mr-1 h-4 w-4" /> Share
        </Button>
        <Button
          variant="outline"
          className="h-11 rounded-full"
          onClick={() => setShowSensitive((s) => !s)}
        >
          {showSensitive ? <EyeOff className="mr-1 h-4 w-4" /> : <Eye className="mr-1 h-4 w-4" />}
          {showSensitive ? "Hide" : "Reveal"} details
        </Button>
      </div>

      <section className="px-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Verified claims
        </h2>
        <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
          {data.claims.map((c, i) => (
            <div
              key={c.label}
              className={`flex items-center justify-between px-4 py-3 ${i > 0 ? "border-t" : ""}`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-success" />
                <span className="text-sm text-muted-foreground">{c.label}</span>
              </div>
              <span className={`text-sm font-medium ${c.sensitive ? "font-mono" : ""}`}>
                {c.sensitive && !showSensitive ? "••••••••" : c.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Lifecycle
        </h2>
        <div className="rounded-2xl border bg-card p-4 shadow-card">
          <Row label="Status">
            <StatusBadge
              tone={
                data.status === "active"
                  ? "success"
                  : data.status === "revoked"
                    ? "destructive"
                    : "muted"
              }
            >
              {data.status}
            </StatusBadge>
          </Row>
          <Row label="Issuer">{data.issuer}</Row>
          <Row label="Issued">{formatDate(data.issuedAt)}</Row>
          <Row label="Expires">{formatDate(data.expiresAt)}</Row>
          <Row label="Serial">
            <span className="font-mono text-xs">{data.serial}</span>
          </Row>
        </div>
      </section>

      <div className="px-5 pb-6">
        <Button
          variant="ghost"
          className="w-full text-destructive hover:bg-destructive/5 hover:text-destructive"
          disabled={data.status !== "active"}
          onClick={() => setRevokeOpen(true)}
        >
          Revoke this credential
        </Button>
      </div>

      {/* Share QR */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share credential</DialogTitle>
            <DialogDescription>
              Scan from a partner app or terminal. Code expires in 60 seconds.
            </DialogDescription>
          </DialogHeader>
          <div className="my-2 flex flex-col items-center gap-3">
            <FakeQR seed={data.id} />
            <p className="font-mono text-xs text-muted-foreground">znx://{data.serial}</p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                navigator.clipboard?.writeText(`znx://${data.serial}`);
                toast.success("Link copied");
              }}
            >
              <Share2 className="mr-1 h-4 w-4" /> Copy link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke confirm */}
      <Dialog open={revokeOpen} onOpenChange={setRevokeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke this credential?</DialogTitle>
            <DialogDescription>
              You will need to re-verify before this credential can be reissued.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setRevokeOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => revoke.mutate()}
              disabled={revoke.isPending}
            >
              Revoke
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-2.5 last:border-0">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{children}</span>
    </div>
  );
}

// Decorative QR-like grid (deterministic from seed)
function FakeQR({ seed }: { seed: string }) {
  const size = 21;
  const cells: boolean[] = [];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  for (let i = 0; i < size * size; i++) {
    h = (h * 1664525 + 1013904223) >>> 0;
    cells.push((h & 1) === 1);
  }
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-card">
      <div className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
        {cells.map((on, i) => (
          <div
            key={i}
            className={`aspect-square rounded-[2px] ${on ? "bg-foreground" : "bg-transparent"}`}
          />
        ))}
      </div>
    </div>
  );
}
