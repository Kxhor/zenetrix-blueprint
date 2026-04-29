import { useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UploadCloud, FileCheck2, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { OnboardingProgress } from "@/components/onboarding-progress";
import { useOnboardingStore } from "@/stores/onboarding-store";

export const Route = createFileRoute("/_wallet/onboarding/identity")({
  component: OnboardingIdentity,
});

const schema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  dob: z.string().min(1, "Select your date of birth"),
  aadhaar: z.string().regex(/^\d{12}$/, "12 digit Aadhaar required"),
  pan: z.string().regex(/^[A-Z]{5}\d{4}[A-Z]$/, "Invalid PAN format"),
  address: z.string().min(8, "Enter your address"),
});

function OnboardingIdentity() {
  const navigate = useNavigate();
  const { identity, setIdentity } = useOnboardingStore();
  const [doc, setDoc] = useState<{ name: string; url: string } | null>(
    identity.documentName && identity.documentPreview
      ? { name: identity.documentName, url: identity.documentPreview }
      : null,
  );
  const fileRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: identity.fullName ?? "Aarav Sharma",
      dob: identity.dob ?? "1994-03-12",
      aadhaar: identity.aadhaar ?? "",
      pan: identity.pan ?? "",
      address: identity.address ?? "",
    },
  });

  function onFile(file: File) {
    // Revoke previous object URL to prevent memory leak
    if (doc?.url) URL.revokeObjectURL(doc.url);
    const url = URL.createObjectURL(file);
    setDoc({ name: file.name, url });
    setIdentity({ documentName: file.name, documentPreview: url });
  }

  function submit(values: z.infer<typeof schema>) {
    setIdentity(values);
    navigate({ to: "/onboarding/liveness" });
  }

  return (
    <div className="pb-12">
      <OnboardingProgress current="identity" back="/onboarding/start" />
      <form onSubmit={form.handleSubmit(submit)} className="space-y-5 px-5 pt-6">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Identity details</h1>
          <p className="text-sm text-muted-foreground">
            All fields are encrypted and stored on your device.
          </p>
        </div>

        <Field label="Full name (as on PAN)" error={form.formState.errors.fullName?.message}>
          <Input {...form.register("fullName")} className="h-11" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Date of birth" error={form.formState.errors.dob?.message}>
            <Input type="date" {...form.register("dob")} className="h-11" />
          </Field>
          <Field label="PAN" error={form.formState.errors.pan?.message}>
            <Input
              {...form.register("pan", { setValueAs: (v) => String(v).toUpperCase() })}
              className="h-11 font-mono uppercase tracking-wider"
              placeholder="ABCDE1234F"
              maxLength={10}
            />
          </Field>
        </div>

        <Field label="Aadhaar number" error={form.formState.errors.aadhaar?.message}>
          <Input
            {...form.register("aadhaar")}
            inputMode="numeric"
            placeholder="1234 5678 9012"
            className="h-11 font-mono tracking-wider"
            maxLength={12}
          />
        </Field>

        <Field label="Address" error={form.formState.errors.address?.message}>
          <Textarea
            {...form.register("address")}
            rows={3}
            placeholder="House no., street, city, state, PIN"
          />
        </Field>

        <div>
          <Label className="mb-1.5 block text-sm">Upload document (optional)</Label>
          {doc ? (
            <div className="flex items-center justify-between rounded-2xl border bg-card p-3 shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
                  <FileCheck2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">Encrypted on device</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (doc?.url) URL.revokeObjectURL(doc.url);
                  setDoc(null);
                  setIdentity({ documentName: undefined, documentPreview: undefined });
                }}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
                aria-label="Remove"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="group flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed bg-card/50 p-8 text-sm transition hover:border-accent hover:bg-accent/5"
            >
              <UploadCloud className="h-6 w-6 text-muted-foreground transition group-hover:text-accent" />
              <span className="font-medium">Tap to upload</span>
              <span className="text-xs text-muted-foreground">PDF, JPG, PNG up to 10 MB</span>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
          />
        </div>

        <Button type="submit" size="lg" className="h-12 w-full rounded-full text-base">
          Continue <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
