import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { api } from "@/mocks/api";
import { AdminPageHeader } from "./_admin";
import { KpiTile } from "@/components/kpi-tile";
import { SkeletonCard } from "@/components/skeletons";
import { mockApprovalsTrend } from "@/mocks/fixtures";

export const Route = createFileRoute("/_admin/admin/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: api.dashboard });
  const sparkSessions = mockApprovalsTrend.map((d) => d.approved);
  const sparkRejected = mockApprovalsTrend.map((d) => d.rejected);

  return (
    <>
      <AdminPageHeader
        title="Operations dashboard"
        subtitle="Live view of verification throughput and risk."
      />
      <div className="space-y-6 p-6">
        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {isLoading || !data ? (
            <>
              <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
            </>
          ) : (
            <>
              <KpiTile label="Sessions today" value={data.kpis.sessionsToday} delta={data.kpis.sessionsTodayDelta} spark={sparkSessions} />
              <KpiTile label="Approval rate" value={data.kpis.approvalRate} delta={data.kpis.approvalRateDelta} suffix="%" decimals={1} spark={sparkSessions} />
              <KpiTile label="Average risk" value={data.kpis.avgRisk} delta={data.kpis.avgRiskDelta} decimals={1} invertDelta spark={sparkRejected} />
              <KpiTile label="Pending review" value={data.kpis.pending} delta={data.kpis.pendingDelta} invertDelta spark={sparkRejected} />
            </>
          )}
        </div>

        {/* Charts */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border bg-card p-5 shadow-card lg:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold tracking-tight">Approvals trend</h2>
                <p className="text-xs text-muted-foreground">Last 14 days</p>
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.approvalsTrend ?? []} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="oklch(0.7 0.14 230)" stopOpacity={0.45} />
                      <stop offset="1" stopColor="oklch(0.7 0.14 230)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="oklch(0.62 0.16 148)" stopOpacity={0.4} />
                      <stop offset="1" stopColor="oklch(0.62 0.16 148)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="oklch(0.92 0.008 250)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} width={32} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid oklch(0.92 0.008 250)",
                      boxShadow: "0 8px 24px -8px oklch(0.2 0.04 250 / 0.15)",
                      fontSize: 12,
                    }}
                  />
                  <Area type="monotone" dataKey="approved" stroke="oklch(0.62 0.16 148)" fill="url(#gr)" strokeWidth={2} />
                  <Area type="monotone" dataKey="rejected" stroke="oklch(0.7 0.14 230)" fill="url(#ga)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-card">
            <h2 className="font-display text-lg font-semibold tracking-tight">Risk distribution</h2>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
            <div className="mt-4 h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.riskDistribution ?? []}>
                  <CartesianGrid stroke="oklch(0.92 0.008 250)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="band" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} width={32} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid oklch(0.92 0.008 250)",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="oklch(0.32 0.05 248)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
