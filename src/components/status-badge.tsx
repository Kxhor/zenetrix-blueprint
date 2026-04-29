import { cn } from "@/lib/utils";
import { Check, Clock, AlertTriangle, XCircle, ShieldAlert, Loader2 } from "lucide-react";

type Tone = "success" | "warning" | "destructive" | "info" | "muted" | "primary";

const toneStyles: Record<Tone, string> = {
  success:
    "bg-success/10 text-success border-success/20",
  warning:
    "bg-warning/15 text-warning-foreground border-warning/30",
  destructive:
    "bg-destructive/10 text-destructive border-destructive/20",
  info: "bg-accent/10 text-accent border-accent/20",
  muted: "bg-muted text-muted-foreground border-border",
  primary: "bg-primary/10 text-primary border-primary/20",
};

const iconMap = {
  success: Check,
  warning: AlertTriangle,
  destructive: XCircle,
  info: Clock,
  muted: Clock,
  primary: ShieldAlert,
} as const;

export function StatusBadge({
  tone,
  children,
  icon: Icon,
  className,
  pulse,
}: {
  tone: Tone;
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  pulse?: boolean;
}) {
  const I = Icon ?? iconMap[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        toneStyles[tone],
        className,
      )}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      )}
      {I && !pulse && <I className="h-3 w-3" />}
      {children}
    </span>
  );
}

export function SessionStatusBadge({ status }: { status: string }) {
  const map: Record<string, { tone: Tone; label: string }> = {
    pending: { tone: "muted", label: "Pending" },
    "in-review": { tone: "info", label: "In review" },
    approved: { tone: "success", label: "Approved" },
    rejected: { tone: "destructive", label: "Rejected" },
    escalated: { tone: "warning", label: "Escalated" },
    active: { tone: "success", label: "Active" },
    revoked: { tone: "destructive", label: "Revoked" },
    expired: { tone: "muted", label: "Expired" },
  };
  const item = map[status] ?? { tone: "muted" as Tone, label: status };
  return (
    <StatusBadge tone={item.tone} icon={status === "in-review" ? Loader2 : undefined}>
      {item.label}
    </StatusBadge>
  );
}
