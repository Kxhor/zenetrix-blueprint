import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Clock } from "lucide-react";
import { api } from "@/mocks/api";
import { AdminPageHeader } from "./_admin";
import { SessionStatusBadge } from "@/components/status-badge";
import { formatRelativeTime } from "@/lib/format";

export const Route = createFileRoute("/_admin/admin/cases")({
  component: Cases,
});

function Cases() {
  const { data } = useQuery({
    queryKey: ["sessions", "escalated"],
    queryFn: () => api.listSessions({ status: "escalated", pageSize: 50 }),
  });
  const rows = data?.rows ?? [];

  return (
    <>
      <AdminPageHeader title="Escalated cases" subtitle={`${rows.length} cases need senior review.`} />
      <div className="space-y-3 p-6">
        {rows.length === 0 && (
          <div className="rounded-2xl border bg-card p-10 text-center shadow-card">
            <AlertTriangle className="mx-auto h-7 w-7 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">No escalated cases</p>
            <p className="text-xs text-muted-foreground">All clear for now.</p>
          </div>
        )}
        {rows.map((s) => (
          <Link
            key={s.id}
            to="/admin/sessions/$id"
            params={{ id: s.id }}
            className="flex items-center justify-between gap-4 rounded-2xl border bg-card p-4 shadow-card transition hover:shadow-elegant"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/15 text-warning-foreground">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">{s.applicantName}</p>
                <p className="font-mono text-xs text-muted-foreground">{s.id}</p>
              </div>
            </div>
            <div className="hidden flex-1 max-w-md text-xs text-muted-foreground sm:block">
              {s.notes ?? "Escalated for manual review."}
            </div>
            <div className="hidden text-xs text-muted-foreground md:block">
              <Clock className="mr-1 inline h-3 w-3" /> {formatRelativeTime(s.submittedAt)}
            </div>
            <SessionStatusBadge status={s.status} />
          </Link>
        ))}
      </div>
    </>
  );
}
