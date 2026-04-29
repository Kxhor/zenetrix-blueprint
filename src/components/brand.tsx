import { cn } from "@/lib/utils";

export function ZenetrixMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={cn("h-7 w-7", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id="zx-g1" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="oklch(0.32 0.05 248)" />
          <stop offset="0.55" stopColor="oklch(0.42 0.1 235)" />
          <stop offset="1" stopColor="oklch(0.7 0.14 230)" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#zx-g1)" />
      <path
        d="M9 10.5h14L11 21.5h12"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ZenetrixWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <ZenetrixMark />
      <span className="font-display text-[1.05rem] font-semibold tracking-tight">
        Zenetrix
      </span>
    </span>
  );
}
