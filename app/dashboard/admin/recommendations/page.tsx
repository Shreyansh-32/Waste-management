"use client";

import useSWR from "swr";
import { Lightbulb, MapPin, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Recommendation {
  locationId: string;
  locationName: string;
  locationType: string;
  totalIssues: number;
  criticalCount: number;
  highCount: number;
  score: number;
  topCategory: string;
  daysSinceOldest: number;
  recommendation: string;
  urgency: "critical" | "high" | "medium";
}

const urgencyConfig = {
  critical: {
    badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-red-200 dark:border-red-800",
    icon: AlertTriangle,
    iconColor: "text-red-500",
    border: "border-red-200 dark:border-red-800/50",
    header: "bg-red-50 dark:bg-red-900/20",
  },
  high: {
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 border-orange-200 dark:border-orange-800",
    icon: AlertTriangle,
    iconColor: "text-orange-500",
    border: "border-orange-200 dark:border-orange-800/50",
    header: "bg-orange-50 dark:bg-orange-900/20",
  },
  medium: {
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    icon: Clock,
    iconColor: "text-amber-500",
    border: "border-amber-200 dark:border-amber-800/50",
    header: "bg-amber-50 dark:bg-amber-900/20",
  },
};

export default function AdminRecommendationsPage() {
  const { data, isLoading } = useSWR("/api/dashboard/admin/recommendations", fetcher, { refreshInterval: 60000 });

  const recommendations: Recommendation[] = data?.recommendations ?? [];

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-44 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-500 to-violet-600 dark:from-violet-700 dark:to-violet-800 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Lightbulb className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold">AI-Powered Cleaning Recommendations</h2>
        </div>
        <p className="text-violet-100 text-sm leading-relaxed">
          Based on issue frequency, priority levels, and time-since-reported, here are the locations that need immediate cleaning attention.
        </p>
      </div>

      {recommendations.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-16 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
          <p className="font-semibold text-slate-700 dark:text-slate-300">All clear!</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">No locations require immediate attention right now</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {recommendations.map((rec, i) => {
            const config = urgencyConfig[rec.urgency];
            const UrgencyIcon = config.icon;

            return (
              <div
                key={rec.locationId}
                className={cn(
                  "bg-white dark:bg-slate-900 rounded-2xl border overflow-hidden shadow-sm",
                  config.border
                )}
              >
                {/* Card header */}
                <div className={cn("px-5 py-4 border-b", config.header, config.border)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg font-black text-slate-400 dark:text-slate-600">
                        #{i + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{rec.locationName}</p>
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500">{rec.locationType} · {rec.topCategory}</p>
                      </div>
                    </div>
                    <span className={cn("text-xs font-bold px-2.5 py-1 rounded-lg border capitalize", config.badge)}>
                      {rec.urgency}
                    </span>
                  </div>
                </div>

                {/* Card body */}
                <div className="px-5 py-4">
                  <div className="flex items-start gap-3 mb-4">
                    <UrgencyIcon className={cn("w-4 h-4 mt-0.5 shrink-0", config.iconColor)} />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{rec.recommendation}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5">
                      <p className="text-lg font-black text-slate-800 dark:text-slate-200">{rec.totalIssues}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">Open Issues</p>
                    </div>
                    <div className="text-center bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5">
                      <p className="text-lg font-black text-red-500">{rec.criticalCount}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">Critical</p>
                    </div>
                    <div className="text-center bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5">
                      <p className="text-lg font-black text-slate-800 dark:text-slate-200">{rec.daysSinceOldest}d</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">Oldest Issue</p>
                    </div>
                  </div>

                  {/* Priority score bar */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs text-slate-400 dark:text-slate-500">Priority Score</span>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{rec.score}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          rec.urgency === "critical" ? "bg-red-500" :
                          rec.urgency === "high" ? "bg-orange-400" : "bg-amber-400"
                        )}
                        style={{ width: `${Math.min(100, rec.score / 2)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
