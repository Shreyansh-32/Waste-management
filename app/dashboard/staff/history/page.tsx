"use client";

import useSWR from "swr";
import { CheckCircle2, MapPin, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const priorityColors: Record<string, string> = {
  LOW:      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  MEDIUM:   "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  HIGH:     "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
  CRITICAL: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

export default function StaffHistoryPage() {
  const { data, isLoading } = useSWR("/api/dashboard/staff/history", fetcher);
  const assignments = data?.assignments ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Tasks Completed", value: assignments.length, icon: CheckCircle2, color: "text-emerald-500" },
          {
            label: "Avg Resolution",
            value: assignments.length > 0
              ? `${Math.round(assignments.reduce((s: number, a: { startedAt: string | null; completedAt: string | null }) => {
                  if (!a.startedAt || !a.completedAt) return s;
                  return s + (new Date(a.completedAt).getTime() - new Date(a.startedAt).getTime()) / 3_600_000;
                }, 0) / assignments.length)}h`
              : "—",
            icon: Clock, color: "text-amber-500",
          },
          { label: "This Month", value: assignments.filter((a: { completedAt: string }) => {
              const d = new Date(a.completedAt);
              const now = new Date();
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }).length, icon: CheckCircle2, color: "text-sky-500",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 text-center">
              <Icon className={cn("w-6 h-6 mx-auto mb-2", item.color)} />
              <p className="text-2xl font-black text-slate-800 dark:text-slate-200">{item.value}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{item.label}</p>
            </div>
          );
        })}
      </div>

      {assignments.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-16 text-center">
          <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">No completed tasks yet</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Completed Tasks</h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {assignments.map((a: {
              id: string;
              completedAt: string;
              startedAt: string | null;
              completionNote: string | null;
              issue: {
                title: string | null;
                description: string;
                category: string;
                priority: string;
                location: { name: string };
              };
            }) => {
              const resolutionHours = a.startedAt && a.completedAt
                ? Math.round((new Date(a.completedAt).getTime() - new Date(a.startedAt).getTime()) / 3_600_000)
                : null;

              return (
                <div key={a.id} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
                        {a.issue.title ?? a.issue.description.slice(0, 80)}
                      </p>
                      <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0", priorityColors[a.issue.priority])}>
                        {a.issue.priority}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {a.issue.location.name}
                      </span>
                      <span>{a.issue.category}</span>
                      {resolutionHours !== null && (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          <Clock className="w-3 h-3" />
                          {resolutionHours}h to resolve
                        </span>
                      )}
                    </div>
                    {a.completionNote && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 italic">
                        &quot;{a.completionNote}&quot;
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {new Date(a.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
