"use client";

import useSWR from "swr";
import {
  AlertCircle, CheckCircle2, Clock, Users,
  TrendingUp, MapPin, Calendar, ArrowRight,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import Link from "next/link";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const statusColors: Record<string, string> = {
  PENDING:     "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  ASSIGNED:    "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400",
  IN_PROGRESS: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
  RESOLVED:    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  REJECTED:    "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

const priorityColors: Record<string, string> = {
  LOW:      "text-slate-400",
  MEDIUM:   "text-amber-500",
  HIGH:     "text-orange-500",
  CRITICAL: "text-red-500",
};

export default function AdminOverviewPage() {
  const { data, isLoading } = useSWR("/api/dashboard/admin/stats", fetcher, { refreshInterval: 30000 });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const stats = data ?? {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-700 dark:to-emerald-800 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold">Good morning, Admin 👋</h2>
            <p className="text-emerald-100 text-sm mt-1">
              Here&apos;s what&apos;s happening across campus today
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </span>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Issues"
          value={stats.totalIssues ?? 0}
          icon={AlertCircle}
          color="sky"
          trend={{ value: 5, label: "this week" }}
        />
        <StatCard
          title="Pending"
          value={stats.pendingIssues ?? 0}
          subtitle="Awaiting assignment"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Resolved"
          value={stats.resolvedIssues ?? 0}
          subtitle="Successfully closed"
          icon={CheckCircle2}
          color="emerald"
          trend={{ value: 12, label: "vs last week" }}
        />
        <StatCard
          title="Active Staff"
          value={stats.totalStaff ?? 0}
          subtitle="On duty today"
          icon={Users}
          color="violet"
        />
      </div>

      {/* Resolution rate + quick links */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Resolution rate */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Resolution Rate</h3>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-4xl font-black text-slate-900 dark:text-slate-100">
              {stats.resolutionRate ?? 0}%
            </span>
          </div>
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-700"
              style={{ width: `${stats.resolutionRate ?? 0}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
            {stats.inProgressIssues ?? 0} in progress right now
          </p>
        </div>

        {/* Quick navigation */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Assign Tasks", desc: "Open Kanban board", href: "/dashboard/admin/kanban", color: "emerald" },
              { label: "View Heatmap", desc: "See problem zones", href: "/dashboard/admin/heatmap", color: "amber" },
              { label: "Recommendations", desc: "AI-driven insights", href: "/dashboard/admin/recommendations", color: "violet" },
              { label: "Staff Performance", desc: "Team analytics", href: "/dashboard/admin/staff", color: "sky" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-150"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{item.label}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{item.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent issues */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Recent Issues</h3>
          <Link
            href="/dashboard/admin/kanban"
            className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {(stats.recentIssues ?? []).length === 0 ? (
            <div className="px-5 py-10 text-center text-slate-400 dark:text-slate-500 text-sm">
              No issues yet
            </div>
          ) : (
            (stats.recentIssues ?? []).map((issue: {
              id: string;
              title?: string;
              description: string;
              status: string;
              priority: string;
              category: string;
              location: { name: string };
              reporter?: { name: string } | null;
              createdAt: string;
            }) => (
              <div key={issue.id} className="flex items-center gap-4 px-5 py-3.5">
                <MapPin className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                    {issue.title ?? issue.description.slice(0, 60)}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {issue.location.name} · {issue.reporter?.name ?? "Anonymous"}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn("text-[10px] font-bold", priorityColors[issue.priority])}>
                    {issue.priority}
                  </span>
                  <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-lg", statusColors[issue.status])}>
                    {issue.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
