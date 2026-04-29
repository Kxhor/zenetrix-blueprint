import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download, Search } from "lucide-react";
import { api } from "@/lib/api-client";
import { AdminPageHeader } from "./_admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDateTime, shortHash } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/admin/audit")({
  component: Audit,
});

function Audit() {
  const { data } = useQuery({ queryKey: ["audit"], queryFn: api.listAudit });
  const [q, setQ] = useState("");
  const rows = (data ?? []).filter(
    (r) =>
      !q ||
      r.actor.toLowerCase().includes(q.toLowerCase()) ||
      r.action.toLowerCase().includes(q.toLowerCase()) ||
      r.resource.toLowerCase().includes(q.toLowerCase()),
  );

  function exportCsv() {
    const header = ["timestamp", "actor", "action", "resource", "hash", "ip"];
    const csv = [
      header.join(","),
      ...rows.map((r) => [r.at, r.actor, r.action, r.resource, r.hash, r.ip].join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zenetrix-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Audit log exported");
  }

  return (
    <>
      <AdminPageHeader
        title="Audit log"
        subtitle="Tamper-evident record of every analyst and system action."
        actions={
          <Button onClick={exportCsv} variant="outline">
            <Download className="mr-1 h-4 w-4" /> Export CSV
          </Button>
        }
      />
      <div className="space-y-4 p-6">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search actor, action or resource…"
            className="h-9 pl-9"
          />
        </div>
        <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Timestamp</th>
                  <th className="px-4 py-3 text-left font-medium">Actor</th>
                  <th className="px-4 py-3 text-left font-medium">Action</th>
                  <th className="px-4 py-3 text-left font-medium">Resource</th>
                  <th className="px-4 py-3 text-left font-medium">Hash</th>
                  <th className="px-4 py-3 text-left font-medium">IP</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDateTime(r.at)}
                    </td>
                    <td className="px-4 py-3 font-medium">{r.actor}</td>
                    <td className="px-4 py-3 font-mono text-xs">{r.action}</td>
                    <td className="px-4 py-3 font-mono text-xs">{r.resource}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {shortHash(r.hash, 6)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
