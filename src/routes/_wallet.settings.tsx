import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronRight, Globe2, Type, Eye, BellRing, ShieldCheck, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { WalletPageHeader } from "./_wallet";
import { useUiStore } from "@/stores/ui-store";
import { useAuthStore } from "@/stores/auth-store";

export const Route = createFileRoute("/_wallet/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const ui = useUiStore();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  return (
    <div className="space-y-6 pb-2">
      <WalletPageHeader title="Settings" subtitle="Account, accessibility & preferences." />

      {/* Profile */}
      <div className="px-5">
        <div className="flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-card">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full text-base font-semibold text-primary-foreground"
            style={{ background: user?.avatarColor ?? "#0EA5E9" }}
          >
            {user?.name?.[0] ?? "Z"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user?.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.phone ?? user?.email}</p>
          </div>
          <ShieldCheck className="h-5 w-5 text-success" />
        </div>
      </div>

      {/* Preferences */}
      <Section title="Preferences">
        <Row icon={Globe2} label="Language">
          <select
            value={ui.language}
            onChange={(e) => ui.setLanguage(e.target.value as "en" | "hi" | "ta")}
            className="rounded-md border bg-background px-2 py-1 text-sm"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="ta">தமிழ்</option>
          </select>
        </Row>
        <Row icon={Type} label="Larger text">
          <Switch
            checked={ui.textScale === "large"}
            onCheckedChange={(v) => ui.setTextScale(v ? "large" : "normal")}
          />
        </Row>
        <Row icon={Eye} label="High contrast">
          <Switch checked={ui.highContrast} onCheckedChange={ui.setHighContrast} />
        </Row>
        <Row icon={BellRing} label="Notifications">
          <Switch defaultChecked />
        </Row>
      </Section>

      <div className="px-5">
        <Button
          variant="outline"
          className="w-full text-destructive hover:bg-destructive/5 hover:text-destructive"
          onClick={() => {
            logout();
            navigate({ to: "/" });
          }}
        >
          <LogOut className="mr-1 h-4 w-4" /> Sign out
        </Button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-5">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      <div className="overflow-hidden rounded-2xl border bg-card shadow-card">{children}</div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b px-4 py-3 last:border-0">
      <div className="flex items-center gap-2.5">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">{label}</span>
      </div>
      {children ?? <ChevronRight className="h-4 w-4 text-muted-foreground" />}
    </div>
  );
}
