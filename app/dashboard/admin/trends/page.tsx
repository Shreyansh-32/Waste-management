"use client";

import useSWR from "swr";
import { useMemo, useState } from "react";
import { Loader2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const periods = ["weekly", "monthly"] as const;

export default function AdminTrendsPage() {
  const [period, setPeriod] = useState<(typeof periods)[number]>("weekly");
  const { data, isLoading } = useSWR(`/api/analytics/trends?period=${period}`, fetcher);

  const trends = data?.trends ?? [];
  const summary = data?.summary ?? {};

  const maxReported = useMemo(() => Math.max(...trends.map((t: { reported: number }) => t.reported), 1), [trends]);
  const maxScore = useMemo(() => Math.max(...trends.map((t: { cleanlinessScore: number }) => t.cleanlinessScore), 1), [trends]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Cleanliness Trends</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500">Track reported vs resolved issues.</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as (typeof periods)[number])}
          className="ml-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-300"
        >
          {periods.map((p) => (
            <option key={p} value={p}>{p === "weekly" ? "Last 7 days" : "Last 30 days"}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Current Score", value: summary.currentScore ?? 0 },
              { label: "Avg Score", value: summary.avgScore ?? 0 },
              { label: "Reported", value: summary.totalReported ?? 0 },
              { label: "Resolved", value: summary.totalResolved ?? 0 },
            ].map((item) => (
              <div key={item.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
                <p className="text-xs text-slate-400 dark:text-slate-500">{item.label}</p>
                <p className="text-2xl font-black text-slate-800 dark:text-slate-200">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Daily Score</h3>
            </div>
            <div className="grid grid-cols-7 md:grid-cols-10 lg:grid-cols-14 gap-2">
              {trends.map((t: { date: string; day: string | number; cleanlinessScore: number }) => (
                <div key={t.date} className="flex flex-col items-center gap-2">
                  <div className="w-full h-20 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-end overflow-hidden">
                    <div
                      className="w-full bg-gradient-to-t from-emerald-400 to-emerald-600 rounded-xl"
                      style={{ height: `${Math.max(8, (t.cleanlinessScore / maxScore) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">{t.day}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Reported vs Resolved</h3>
            <div className="space-y-2">
              {trends.map((t: { date: string; day: string | number; reported: number; resolved: number }) => (
                <div key={t.date} className="flex items-center gap-3">
                  <span className="text-[10px] w-8 text-slate-400 dark:text-slate-500">{t.day}</span>
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400"
                      style={{ width: `${(t.reported / maxReported) * 100}%` }}
                    />
                  </div>
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${(t.resolved / maxReported) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">{t.reported}/{t.resolved}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 mt-4 text-xs text-slate-400 dark:text-slate-500">
              <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" />Reported</span>
              <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />Resolved</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
