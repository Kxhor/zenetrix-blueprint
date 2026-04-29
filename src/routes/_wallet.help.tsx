import { createFileRoute } from "@tanstack/react-router";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { WalletPageHeader } from "./_wallet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LifeBuoy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_wallet/help")({
  component: HelpPage,
});

const faqs = [
  { q: "Is my data stored on Zenetrix servers?", a: "Verifiable credentials live on your device. Zenetrix only stores cryptographic proofs needed for revocation and audit." },
  { q: "What happens if I lose my phone?", a: "Sign in on a new device with OTP and recover your wallet from the encrypted backup. Old device access is revoked automatically." },
  { q: "How long is a consent valid?", a: "Each request defines its own duration — usually 7 to 30 days. You can revoke any active consent at any time." },
  { q: "Will partners see my Aadhaar number?", a: "Only the last 4 digits unless explicitly required by regulation. We share zero-knowledge proofs whenever possible." },
];

function HelpPage() {
  return (
    <div className="space-y-6 pb-2">
      <WalletPageHeader title="Help & support" subtitle="Common questions and contact us." />

      <div className="px-5">
        <Accordion type="single" collapsible className="overflow-hidden rounded-2xl border bg-card shadow-card">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={String(i)} className="border-b last:border-0">
              <AccordionTrigger className="px-4 text-left text-sm font-medium hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="px-4 text-sm text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="px-5">
        <div className="rounded-2xl border bg-card p-5 shadow-card">
          <div className="flex items-center gap-2">
            <LifeBuoy className="h-4 w-4 text-accent" />
            <h2 className="text-sm font-semibold">Contact support</h2>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Message sent", { description: "We'll get back to you within 24 hours." });
              (e.target as HTMLFormElement).reset();
            }}
            className="mt-4 space-y-3"
          >
            <div className="space-y-1.5">
              <Label htmlFor="subj">Subject</Label>
              <Input id="subj" required placeholder="What can we help with?" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="msg">Message</Label>
              <Textarea id="msg" required rows={4} placeholder="Describe your issue" />
            </div>
            <Button type="submit" className="w-full rounded-full">Send message</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
