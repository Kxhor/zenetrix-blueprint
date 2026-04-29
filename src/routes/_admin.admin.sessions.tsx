import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, ArrowRight } from "lucide-react";
import { api } from "@/mocks/api";
import { AdminPageHeader } from "./_admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SessionStatusBadge } from "@/components/status-badge";
import { formatRelativeTime, riskBand } from "@/lib/format";
import type { SessionStatus } from "@/mocks/fixtures";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_admin/admin/sessions")({
  component: Sessions,
});

const statusFilters: ("all" | SessionStatus)[] = ["all", "pending", "in-review", "approved", "rejected", "escalated"];
const riskFilters = ["all", "low", "medium", "high"] as const;

function Sessions() {
  const [status, setStatus] = useState<typeof statusFilters[number]>("all");
  const [risk, setRisk] = useState<typeof riskFilters[number]>("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["sessions", { status, risk, q, page }],
    queryFn: () => api.listSessions({ status, risk, q, page, pageSize }),
  });

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / pageSize));

  return (
    <>
      <AdminPageHeader title="Sessions queue" subtitle={`${data?.total ?? 0} sessions match your filters.`} />
      <div className="space-y-4 p-6">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-3 shadow-card">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, ID or document…"
              className="h-9 pl-9"
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {statusFilters.map((s) => (
              <button
                key={s}
                onClick={() => { setStatus(s); setPage(1); }}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition",
                  status === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/70",
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1">
            {riskFilters.map((r) => (
              <button
                key={r}
                onClick={() => { setRisk(r); setPage(1); }}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition",
                  risk === r
                    ? "bg-foreground text-background"
                    : "border text-muted-foreground hover:bg-muted",
                )}
              >
                {r === "all" ? "All risk" : `${r} risk`}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Session</th>
                  <th className="px-4 py-3 text-left font-medium">Applicant</th>
                  <th className="px-4 py-3 text-left font-medium">Document</th>
                  <th className="px-4 py-3 text-left font-medium">Risk</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Submitted</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading && Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-t">
                    <td colSpan={7} className="px-4 py-4">
                      <div className="h-4 w-full animate-pulse rounded-full bg-muted" />
                    </td>
                  </tr>
                ))}
                {!isLoading && data?.rows.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No sessions match your filters.</td></tr>
                )}
                {data?.rows.map((s) => {
                  const band = riskBand(s.riskScore);
                  const tone = band === "low" ? "text-success" : band === "medium" ? "text-warning-foreground" : "text-destructive";
                  return (
                    <tr key={s.id} className="border-t transition hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono text-xs">{s.id}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{s.applicantName}</p>
                        <p className="text-xs text-muted-foreground">{s.applicantPhone}</p>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span className="rounded bg-muted px-1.5 py-0.5 font-medium uppercase">{s.documentType}</span>
                        <span className="ml-2 font-mono text-muted-foreground">****{s.documentNumber.slice(-4)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("font-mono font-semibold tabular-nums", tone)}>
                          {s.riskScore}
                        </span>
                        <span className="ml-1 text-xs text-muted-foreground">/ 100</span>
                      </td>
                      <td className="px-4 py-3"><SessionStatusBadge status={s.status} /></td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{formatRelativeTime(s.submittedAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to="/admin/sessions/$id"
                          params={{ id: s.id }}
                          className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                        >
                          Open <ArrowRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
