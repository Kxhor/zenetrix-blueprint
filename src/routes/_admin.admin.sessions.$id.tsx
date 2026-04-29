import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronLeft, FileImage, Camera, AlertTriangle } from "lucide-react";
import { api } from "@/mocks/api";
import { AdminPageHeader } from "./_admin";
import { PageLoader } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SessionStatusBadge } from "@/components/status-badge";
import { RiskScoreMeter } from "@/components/risk-score-meter";
import { formatDateTime } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/admin/sessions/$id")({
  component: SessionDetail,
});

function SessionDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({ queryKey: ["session", id], queryFn: () => api.getSession(id) });
  const [note, setNote] = useState("");

  const decide = useMutation({
    mutationFn: (action: "approve" | "reject" | "escalate") => api.decideSession(id, action, note),
    onSuccess: (_d, action) => {
      qc.invalidateQueries({ queryKey: ["sessions"] });
      qc.invalidateQueries({ queryKey: ["session", id] });
      toast.success(`Session ${action === "approve" ? "approved" : action === "reject" ? "rejected" : "escalated"}`);
      navigate({ to: "/admin/sessions" });
    },
  });

  if (isLoading) return <PageLoader />;
  if (!data) return <div className="p-10 text-center text-muted-foreground">Session not found.</div>;

  return (
    <>
      <AdminPageHeader
        title={`Session ${data.id}`}
        subtitle={`Submitted ${formatDateTime(data.submittedAt)} · ${data.channel}`}
        actions={
          <Link to="/admin/sessions" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" /> Back to queue
          </Link>
        }
      />
      <div className="grid gap-4 p-6 lg:grid-cols-3">
        {/* Left — applicant + evidence */}
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl border bg-card p-5 shadow-card">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Applicant</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Info label="Full name" value={data.applicantName} />
              <Info label="Phone" value={data.applicantPhone} mono />
              <Info label="Email" value={data.applicantEmail} />
              <Info label="Channel" value={data.channel} />
              <Info label="Document type" value={data.documentType} />
              <Info label="Document number" value={data.documentNumber} mono />
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-card">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Evidence</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <EvidenceTile label="Document scan" />
              <EvidenceTile label="Selfie capture" face />
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-video rounded-xl border bg-gradient-to-br from-muted to-card" />
              ))}
            </div>
          </div>
        </div>

        {/* Right — risk + decision */}
        <div className="space-y-4">
          <div className="flex flex-col items-center rounded-2xl border bg-card p-5 shadow-card">
            <h2 className="self-start text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Risk score
            </h2>
            <div className="mt-2"><RiskScoreMeter score={data.riskScore} /></div>
            <div className="mt-3 grid w-full grid-cols-2 gap-2 text-xs">
              <Metric label="Liveness" value={`${data.livenessScore}%`} />
              <Metric label="Face match" value={`${data.faceMatchScore}%`} />
            </div>
            {data.flags.length > 0 && (
              <div className="mt-3 w-full rounded-xl border border-warning/30 bg-warning/10 p-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-warning-foreground">
                  <AlertTriangle className="h-3.5 w-3.5" /> Flags
                </div>
                <ul className="mt-1.5 space-y-0.5 text-xs text-warning-foreground">
                  {data.flags.map((f) => (<li key={f}>· {f}</li>))}
                </ul>
              </div>
            )}
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-card">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Status</h2>
            <div className="mt-2"><SessionStatusBadge status={data.status} /></div>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Add a decision note (optional)…"
              className="mt-3"
            />
            <div className="mt-3 grid grid-cols-3 gap-2">
              <Button variant="outline" onClick={() => decide.mutate("escalate")} disabled={decide.isPending}>
                Escalate
              </Button>
              <Button variant="outline" className="text-destructive hover:bg-destructive/5 hover:text-destructive" onClick={() => decide.mutate("reject")} disabled={decide.isPending}>
                Reject
              </Button>
              <Button onClick={() => decide.mutate("approve")} disabled={decide.isPending}>
                Approve
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-0.5 text-sm font-medium ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/50 p-2.5">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-mono text-sm font-semibold tabular-nums">{value}</p>
    </div>
  );
}
function EvidenceTile({ label, face }: { label: string; face?: boolean }) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-muted to-card">
        {face ? <Camera className="h-10 w-10 text-muted-foreground" /> : <FileImage className="h-10 w-10 text-muted-foreground" />}
      </div>
      <div className="border-t bg-card px-3 py-2 text-xs">
        <p className="font-medium">{label}</p>
        <p className="text-muted-foreground">Captured · 1.2 MB</p>
      </div>
    </div>
  );
}
