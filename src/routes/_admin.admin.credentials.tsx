import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, Ban } from "lucide-react";
import { api } from "@/lib/api-client";
import { AdminPageHeader } from "./_admin";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/format";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/admin/credentials")({
  component: Credentials,
});

function Credentials() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["credentials"], queryFn: api.listCredentials });
  const [target, setTarget] = useState<string | null>(null);

  const revoke = useMutation({
    mutationFn: (id: string) => api.revokeCredential(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["credentials"] });
      toast.success("Credential revoked");
      setTarget(null);
    },
  });

  return (
    <>
      <AdminPageHeader
        title="Credential registry"
        subtitle="Issued credentials across the network."
      />
      <div className="space-y-4 p-6">
        <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Title</th>
                <th className="px-4 py-3 text-left font-medium">Serial</th>
                <th className="px-4 py-3 text-left font-medium">Issued</th>
                <th className="px-4 py-3 text-left font-medium">Expires</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {data?.map((c) => (
                <tr key={c.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-success" />
                      <span className="font-medium">{c.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{c.serial}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDate(c.issuedAt)}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDate(c.expiresAt)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      tone={
                        c.status === "active"
                          ? "success"
                          : c.status === "revoked"
                            ? "destructive"
                            : "muted"
                      }
                    >
                      {c.status}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/5 hover:text-destructive"
                      disabled={c.status !== "active"}
                      onClick={() => setTarget(c.id)}
                    >
                      <Ban className="mr-1 h-3 w-3" /> Revoke
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke credential?</DialogTitle>
            <DialogDescription>
              The holder will no longer be able to share this credential. This action is logged.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => target && revoke.mutate(target)}
              disabled={revoke.isPending}
            >
              Revoke
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
