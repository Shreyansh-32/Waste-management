"use client";

import useSWR from "swr";
import { cn } from "@/lib/utils";
import { MapPin, AlertTriangle, TrendingUp } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface HeatmapLocation {
  id: string;
  name: string;
  type: string;
  issueCount: number;
  pendingCount: number;
  resolvedCount: number;
  criticalCount: number;
  topCategory: string | null;
}

function heatColor(count: number, max: number) {
  if (max === 0 || count === 0) return "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500";
  const ratio = count / max;
  if (ratio < 0.2)  return "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400";
  if (ratio < 0.4)  return "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400";
  if (ratio < 0.65) return "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400";
  return "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400";
}

function heatBarColor(count: number, max: number) {
  if (max === 0 || count === 0) return "bg-slate-200 dark:bg-slate-700";
  const ratio = count / max;
  if (ratio < 0.2)  return "bg-emerald-400 dark:bg-emerald-500";
  if (ratio < 0.4)  return "bg-yellow-400 dark:bg-yellow-500";
  if (ratio < 0.65) return "bg-orange-400 dark:bg-orange-500";
  return "bg-red-500 dark:bg-red-600";
}

export default function AdminHeatmapPage() {
  const { data, isLoading } = useSWR("/api/dashboard/admin/heatmap", fetcher, { refreshInterval: 30000 });

  const locations: HeatmapLocation[] = data?.heatmapData ?? [];
  const max = Math.max(...locations.map((l) => l.issueCount), 1);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 bg-white dark:bg-slate-900 rounded-2xl animate-pulse border border-slate-200 dark:border-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Legend */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Risk Level:</span>
          {[
            { label: "Clean",    color: "bg-emerald-400" },
            { label: "Low",      color: "bg-yellow-400" },
            { label: "Medium",   color: "bg-orange-400" },
            { label: "Critical", color: "bg-red-500" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className={cn("w-3 h-3 rounded-sm", item.color)} />
              <span className="text-xs text-slate-500 dark:text-slate-400">{item.label}</span>
            </div>
          ))}
          <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">
            Based on unresolved issue count per location
          </span>
        </div>
      </div>

      {locations.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-16 text-center">
          <MapPin className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">No location data available yet</p>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Add locations to start tracking issues</p>
        </div>
      ) : (
        <>
          {/* Visual heatmap grid */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Campus Issue Heatmap
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-2">
              {locations.map((loc) => (
                <div
                  key={loc.id}
                  title={`${loc.name}: ${loc.issueCount} issues`}
                  className={cn(
                    "aspect-square rounded-xl flex flex-col items-center justify-center p-1 cursor-default transition-transform hover:scale-105",
                    heatColor(loc.issueCount, max)
                  )}
                >
                  <span className="text-lg font-black leading-none">{loc.issueCount}</span>
                  <span className="text-[8px] font-medium text-center leading-tight mt-0.5 truncate w-full text-center px-0.5">
                    {loc.name.split(" ")[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Detail table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Location Breakdown</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {locations.map((loc) => (
                <div key={loc.id} className="flex items-center gap-4 px-5 py-4">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", heatColor(loc.issueCount, max))}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{loc.name}</p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                        {loc.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all", heatBarColor(loc.issueCount, max))}
                          style={{ width: `${Math.round((loc.issueCount / max) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400 w-12 text-right shrink-0">
                        {loc.issueCount} issue{loc.issueCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {loc.criticalCount > 0 && (
                      <div className="flex items-center gap-1 text-red-500 text-xs font-bold">
                        <AlertTriangle className="w-3 h-3" />
                        {loc.criticalCount} critical
                      </div>
                    )}
                    <p className="text-xs text-slate-400 dark:text-slate-500">{loc.pendingCount} pending</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
