import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnboardingProgress } from "@/components/onboarding-progress";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { maskAadhaar, maskPan } from "@/lib/format";

export const Route = createFileRoute("/_wallet/onboarding/review")({
  component: OnboardingReview,
});

function OnboardingReview() {
  const navigate = useNavigate();
  const { identity, livenessScore } = useOnboardingStore();

  function submit() {
    navigate({ to: "/onboarding/success" });
  }

  const rows = [
    { label: "Full name", value: identity.fullName ?? "—" },
    { label: "Date of birth", value: identity.dob ?? "—" },
    { label: "Aadhaar", value: identity.aadhaar ? maskAadhaar(identity.aadhaar) : "—", mono: true },
    { label: "PAN", value: identity.pan ? maskPan(identity.pan) : "—", mono: true },
    { label: "Address", value: identity.address ?? "—" },
    { label: "Document", value: identity.documentName ?? "Not uploaded" },
    { label: "Liveness", value: livenessScore ? `Passed · ${livenessScore}%` : "—" },
  ];

  return (
    <div className="pb-12">
      <OnboardingProgress current="review" back="/onboarding/liveness" />
      <div className="px-5 pt-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Review & confirm</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Make sure everything is correct. You can edit any field before submitting.
        </p>

        <div className="mt-6 overflow-hidden rounded-2xl border bg-card shadow-card">
          {rows.map((r, i) => (
            <div
              key={r.label}
              className={`flex items-center justify-between gap-3 px-4 py-3 ${i > 0 ? "border-t" : ""}`}
            >
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {r.label}
              </span>
              <span className={`text-sm font-medium ${r.mono ? "font-mono" : ""}`}>{r.value}</span>
            </div>
          ))}
        </div>

        <Link
          to="/onboarding/identity"
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
        >
          <Pencil className="h-3.5 w-3.5" /> Edit details
        </Link>

        <div className="mt-7 rounded-2xl border bg-card p-4 shadow-card">
          <div className="flex items-center gap-2 text-sm font-medium">
            <CheckCircle2 className="h-4 w-4 text-success" /> All checks passed
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Document authenticity, face match and liveness verified.
          </p>
        </div>

        <Button size="lg" className="mt-6 h-12 w-full rounded-full text-base" onClick={submit}>
          Issue my credential
        </Button>
      </div>
    </div>
  );
}
