import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { Wallet, FileText, Activity, Settings, LifeBuoy, Bell, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ZenetrixWordmark } from "@/components/brand";
import { useRequireRole } from "@/hooks/use-require-role";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_wallet")({
  component: WalletShell,
});

const tabs = [
  { to: "/wallet", icon: Wallet, label: "Wallet" },
  { to: "/consent", icon: FileText, label: "Consent" },
  { to: "/activity", icon: Activity, label: "Activity" },
  { to: "/settings", icon: Settings, label: "Settings" },
] as const;

function WalletShell() {
  const user = useRequireRole("user");
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (!user) return null;

  // hide bottom nav during onboarding
  const inOnboarding = pathname.startsWith("/onboarding");

  return (
    <div className="relative mx-auto flex min-h-screen max-w-md flex-col bg-background">
      <header className="sticky top-0 z-30 glass-strong border-b safe-top">
        <div className="flex h-14 items-center justify-between px-4">
          <ZenetrixWordmark />
          <Link
            to="/help"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
            aria-label="Help"
          >
            <LifeBuoy className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <main className={cn("flex-1", !inOnboarding && "pb-24")}>
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {!inOnboarding && (
        <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 safe-bottom">
          <div className="mx-3 mb-3 rounded-2xl border bg-card/95 shadow-elegant backdrop-blur-xl">
            <div className="grid grid-cols-4 px-2 py-1.5">
              {tabs.map((t) => {
                const active =
                  pathname === t.to ||
                  (t.to !== "/wallet" && pathname.startsWith(t.to)) ||
                  (t.to === "/wallet" && pathname.startsWith("/wallet"));
                return (
                  <Link
                    key={t.to}
                    to={t.to}
                    className="relative flex flex-col items-center gap-0.5 rounded-xl px-2 py-2"
                  >
                    {active && (
                      <motion.span
                        layoutId="wallet-tab-pill"
                        className="absolute inset-1 -z-0 rounded-xl bg-primary/8"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    <t.icon
                      className={cn(
                        "relative z-10 h-5 w-5 transition-colors",
                        active ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                    <span
                      className={cn(
                        "relative z-10 text-[10.5px] font-medium",
                        active ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      {t.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}

export function WalletPageHeader({
  title,
  subtitle,
  back,
  right,
}: {
  title: string;
  subtitle?: string;
  back?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 pt-5">
      <div className="min-w-0">
        {back && (
          <Link
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            to={back as any}
            className="mb-1 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Back
          </Link>
        )}
        <h1 className="font-display text-2xl font-semibold tracking-tight text-balance">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {right ?? (
        <button
          aria-label="Notifications"
          className="flex h-9 w-9 items-center justify-center rounded-full border bg-card text-muted-foreground hover:bg-muted"
        >
          <Bell className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
