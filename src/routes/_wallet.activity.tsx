import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Award, Ban, CheckCircle2, RefreshCcw, ShieldCheck, ShieldX, FileCheck2, Clock,
} from "lucide-react";
import { api } from "@/mocks/api";
import { WalletPageHeader } from "./_wallet";
import { SkeletonRow } from "@/components/skeletons";
import { formatRelativeTime } from "@/lib/format";
import type { ActivityKind } from "@/mocks/fixtures";

const iconMap: Record<ActivityKind, { icon: React.ComponentType<{ className?: string }>; tone: string }> = {
  "credential.issued": { icon: Award, tone: "bg-success/10 text-success" },
  "credential.revoked": { icon: Ban, tone: "bg-destructive/10 text-destructive" },
  "consent.granted": { icon: CheckCircle2, tone: "bg-accent/10 text-accent" },
  "consent.revoked": { icon: ShieldX, tone: "bg-destructive/10 text-destructive" },
  "session.submitted": { icon: FileCheck2, tone: "bg-primary/10 text-primary" },
  "rekyc.due": { icon: RefreshCcw, tone: "bg-warning/15 text-warning-foreground" },
  "verification.success": { icon: ShieldCheck, tone: "bg-success/10 text-success" },
  "verification.failed": { icon: ShieldX, tone: "bg-destructive/10 text-destructive" },
};

export const Route = createFileRoute("/_wallet/activity")({
  component: ActivityPage,
});

function ActivityPage() {
  const { data, isLoading } = useQuery({ queryKey: ["activity"], queryFn: api.listActivity });

  return (
    <div className="space-y-5 pb-2">
      <WalletPageHeader title="Activity" subtitle="Everything that happened in your wallet." />
      <div className="space-y-2 px-5">
        {isLoading && <><SkeletonRow /><SkeletonRow /><SkeletonRow /></>}
        {data?.map((a) => {
          const { icon: Icon, tone } = iconMap[a.kind];
          return (
            <div key={a.id} className="flex items-start gap-3 rounded-2xl border bg-card p-3.5">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug">{a.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{a.description}</p>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock className="h-3 w-3" /> {formatRelativeTime(a.at)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
