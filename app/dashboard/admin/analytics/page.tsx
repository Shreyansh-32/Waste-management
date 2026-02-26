"use client";

import useSWR from "swr";
import { BarChart2, CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const categoryColors: Record<string, string> = {
  WASHROOM:  "bg-sky-400",
  CLASSROOM: "bg-violet-400",
  HOSTEL:    "bg-amber-400",
  CANTEEN:   "bg-orange-400",
  CORRIDOR:  "bg-emerald-400",
  LAB:       "bg-pink-400",
  OUTDOOR:   "bg-lime-400",
  OTHER:     "bg-slate-400",
};

export default function AdminAnalyticsPage() {
  const { data: statsData, isLoading } = useSWR("/api/analytics/dashboard", fetcher);
  const { data: heatData } = useSWR("/api/analytics/heatmap", fetcher);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
      </div>
    );
  }

  const stats = statsData?.overview ?? {};
  const categoryBreakdown = statsData?.categoryBreakdown ?? [];
  const hotspots = heatData?.hotspots ?? [];

  const statusBreakdown = [
    { label: "Pending",     value: stats.pendingIssues ?? 0,   color: "bg-amber-400",  icon: Clock },
    { label: "In Progress", value: stats.inProgressIssues ?? 0, color: "bg-violet-400", icon: Loader2 },
    { label: "Resolved",    value: stats.resolvedIssues ?? 0,  color: "bg-emerald-400", icon: CheckCircle2 },
    { label: "Rejected",    value: stats.rejectedIssues ?? 0,  color: "bg-red-400",    icon: XCircle },
  ];
  const totalStatus = statusBreakdown.reduce((s, x) => s + x.value, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Key stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Issues" value={stats.totalIssues ?? 0} icon={BarChart2} color="sky" />
        <StatCard title="Resolved" value={stats.resolvedIssues ?? 0} icon={CheckCircle2} color="emerald" />
        <StatCard title="Pending" value={stats.pendingIssues ?? 0} icon={Clock} color="amber" />
        <StatCard title="Cleanliness Score" value={`${stats.cleanlinessScore ?? 0}`} icon={BarChart2} color="violet" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Status breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-5">Issues by Status</h3>
          <div className="space-y-3">
            {statusBreakdown.map((item) => {
              const pct = totalStatus > 0 ? Math.round((item.value / totalStatus) * 100) : 0;
              const Icon = item.icon;
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.value}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 w-8 text-right">{pct}%</span>
                    </div>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700", item.color)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stacked summary bar */}
          <div className="mt-5 flex h-4 rounded-full overflow-hidden gap-0.5">
            {statusBreakdown.map((item) => {
              const pct = totalStatus > 0 ? (item.value / totalStatus) * 100 : 0;
              return pct > 0 ? (
                <div key={item.label} className={cn("h-full", item.color)} style={{ width: `${pct}%` }} title={`${item.label}: ${item.value}`} />
              ) : null;
            })}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-5">Top Issue Categories</h3>
          {categoryBreakdown.length === 0 ? (
            <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">
              No category data yet
            </div>
          ) : (
            <div className="space-y-3">
              {categoryBreakdown
                .slice()
                .sort((a: { count: number }, b: { count: number }) => b.count - a.count)
                .map((entry: { category: string; count: number }) => {
                  const totalCategorized = categoryBreakdown.reduce((a: number, b: { count: number }) => a + b.count, 0);
                  const pct = totalCategorized > 0 ? Math.round((entry.count / totalCategorized) * 100) : 0;
                  const barColor = categoryColors[entry.category] ?? "bg-slate-400";
                  return (
                    <div key={entry.category}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2.5 h-2.5 rounded-sm", barColor)} />
                          <span className="text-sm text-slate-600 dark:text-slate-400 capitalize">{entry.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{entry.count}</span>
                          <span className="text-xs text-slate-400 dark:text-slate-500 w-8 text-right">{pct}%</span>
                        </div>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all duration-700", barColor)}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Top problem locations */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-4">Top Problem Locations</h3>
        {hotspots.length === 0 ? (
          <p className="text-center text-slate-400 dark:text-slate-500 text-sm py-6">No location data yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Location</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Pending</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Critical</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Top Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {hotspots.slice(0, 10).map((loc: {
                  locationId: string;
                  locationName: string;
                  locationType: string;
                  totalIssues: number;
                  activeIssues: number;
                  criticalIssues: number;
                  riskLevel: string;
                }) => (
                  <tr key={loc.locationId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300">{loc.locationName}</td>
                    <td className="py-3 px-3 text-slate-400 dark:text-slate-500 text-xs">{loc.locationType}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-800 dark:text-slate-200">{loc.totalIssues}</td>
                    <td className="py-3 px-3 text-right text-amber-600 dark:text-amber-400 font-semibold">{loc.activeIssues}</td>
                    <td className="py-3 px-3 text-right">
                      {loc.criticalIssues > 0 ? (
                        <span className="text-red-500 font-bold">{loc.criticalIssues}</span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md">
                        {loc.riskLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
