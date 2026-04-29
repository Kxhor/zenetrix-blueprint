import { createFileRoute } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { AdminPageHeader } from "./_admin";

export const Route = createFileRoute("/_admin/admin/settings")({
  component: AdminSettings,
});

const policies = [
  { label: "Risk threshold — auto approve", value: "< 30" },
  { label: "Risk threshold — auto escalate", value: "≥ 70" },
  { label: "Liveness minimum confidence", value: "85%" },
  { label: "Face match minimum", value: "80%" },
  { label: "Re-KYC cycle (high risk)", value: "365 days" },
  { label: "Re-KYC cycle (low risk)", value: "730 days" },
  { label: "Document retention", value: "DPDP-aligned · 7 years" },
  { label: "Default consent duration", value: "30 days" },
];

const providers = [
  { label: "ID provider", value: "UIDAI Aadhaar v2" },
  { label: "Liveness", value: "Zenetrix Vision · v3.4" },
  { label: "Doc auth", value: "Zenetrix DocCheck · v2.1" },
  { label: "Account aggregator", value: "Sahamati AA Network" },
];

function AdminSettings() {
  return (
    <>
      <AdminPageHeader
        title="Policy settings"
        subtitle="Read-only view. Contact compliance to change thresholds."
      />
      <div className="grid gap-4 p-6 lg:grid-cols-2">
        <Section title="Decision policy" rows={policies} />
        <Section title="Providers" rows={providers} />
        <div className="rounded-2xl border bg-card p-5 shadow-card lg:col-span-2">
          <div className="flex items-center gap-2 text-sm">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">Change control</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            All policy changes require dual approval from a compliance lead and a senior analyst.
            Updates are logged in the audit log with a tamper-evident hash chain.
          </p>
        </div>
      </div>
    </>
  );
}

function Section({ title, rows }: { title: string; rows: { label: string; value: string }[] }) {
  return (
    <div className="rounded-2xl border bg-card shadow-card">
      <div className="border-b px-5 py-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h2>
      </div>
      <div>
        {rows.map((r, i) => (
          <div key={r.label} className={`flex items-center justify-between px-5 py-3 ${i > 0 ? "border-t" : ""}`}>
            <span className="text-sm text-muted-foreground">{r.label}</span>
            <span className="text-sm font-medium">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
