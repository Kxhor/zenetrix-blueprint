import { createFileRoute, Outlet, Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ListChecks,
  AlertTriangle,
  FileSearch,
  ShieldCheck,
  Settings,
  Search,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ZenetrixWordmark, ZenetrixMark } from "@/components/brand";
import { useRequireRole } from "@/hooks/use-require-role";
import { useUiStore } from "@/stores/ui-store";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_admin")({
  component: AdminShell,
});

const nav = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/sessions", icon: ListChecks, label: "Sessions" },
  { to: "/admin/cases", icon: AlertTriangle, label: "Cases" },
  { to: "/admin/audit", icon: FileSearch, label: "Audit log" },
  { to: "/admin/credentials", icon: ShieldCheck, label: "Credentials" },
  { to: "/admin/settings", icon: Settings, label: "Settings" },
] as const;

function AdminShell() {
  const user = useRequireRole("admin");
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggle = useUiStore((s) => s.toggleSidebar);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r bg-sidebar transition-[width] md:flex",
          collapsed ? "w-[72px]" : "w-60",
        )}
      >
        <div
          className={cn("flex h-16 items-center border-b px-4", collapsed && "justify-center px-0")}
        >
          {collapsed ? <ZenetrixMark /> : <ZenetrixWordmark />}
        </div>
        <nav className="flex-1 space-y-1 p-2">
          {nav.map((n) => {
            const active = pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                  collapsed && "justify-center px-2",
                )}
                title={collapsed ? n.label : undefined}
              >
                <n.icon className="h-4 w-4" />
                {!collapsed && <span>{n.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-2">
          <button
            onClick={toggle}
            className={cn(
              "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent",
              collapsed && "justify-center px-2",
            )}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 glass-strong border-b">
          <div className="flex h-16 items-center justify-between gap-4 px-5">
            <div className="flex flex-1 items-center gap-3">
              <div className="md:hidden">
                <ZenetrixWordmark />
              </div>
              <div className="relative hidden flex-1 max-w-md md:block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search sessions, cases, credentials…" className="h-9 pl-9" />
                <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-block">
                  ⌘K
                </kbd>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-1.5 rounded-full border bg-card px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground sm:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-success" /> Live · prod
              </span>
              <div className="flex items-center gap-2 rounded-full border bg-card px-1 py-1">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-primary-foreground"
                  style={{ background: user.avatarColor }}
                >
                  {user.name[0]}
                </div>
                <span className="hidden pr-2 text-sm font-medium sm:inline">{user.name}</span>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate({ to: "/admin/login" });
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full border bg-card text-muted-foreground hover:bg-muted"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export function AdminPageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-b bg-background px-6 py-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}
