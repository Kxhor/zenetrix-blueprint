import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingSpinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-4 w-4 animate-spin text-muted-foreground", className)} />;
}

export function PageLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
      <Loader2 className="h-6 w-6 animate-spin text-accent" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border bg-card p-5 shadow-card", className)}>
      <div className="h-3 w-24 animate-pulse rounded-full bg-muted" />
      <div className="mt-4 h-7 w-32 animate-pulse rounded-md bg-muted" />
      <div className="mt-3 h-3 w-full animate-pulse rounded-full bg-muted" />
      <div className="mt-2 h-3 w-2/3 animate-pulse rounded-full bg-muted" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-3">
      <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-1/3 animate-pulse rounded-full bg-muted" />
        <div className="h-3 w-1/4 animate-pulse rounded-full bg-muted" />
      </div>
    </div>
  );
}
