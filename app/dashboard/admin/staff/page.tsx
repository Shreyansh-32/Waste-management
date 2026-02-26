"use client";

import useSWR from "swr";
import { Users, Star, CheckCircle2, Clock, Loader2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface StaffPerformance {
  id: string;
  name: string;
  email: string;
  reputationScore: number;
  totalAssigned: number;
  completed: number;
  active: number;
  completionRate: number;
  avgResolutionHours: number;
}

function ratingColor(rate: number) {
  if (rate >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (rate >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-red-500 dark:text-red-400";
}

function ratingBg(rate: number) {
  if (rate >= 80) return "from-emerald-400 to-emerald-600";
  if (rate >= 60) return "from-amber-400 to-amber-500";
  return "from-red-400 to-red-500";
}

export default function AdminStaffPage() {
  const { data, isLoading } = useSWR("/api/dashboard/admin/staff-performance", fetcher, { refreshInterval: 30000 });

  const staffList: StaffPerformance[] = data?.performance ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
      </div>
    );
  }

  const avgCompletionRate = staffList.length > 0
    ? Math.round(staffList.reduce((s, x) => s + x.completionRate, 0) / staffList.length)
    : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Summary bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Staff", value: staffList.length, icon: Users, color: "text-sky-500" },
          { label: "Avg Completion Rate", value: `${avgCompletionRate}%`, icon: TrendingUp, color: "text-emerald-500" },
          { label: "Total Completed", value: staffList.reduce((s, x) => s + x.completed, 0), icon: CheckCircle2, color: "text-emerald-500" },
          { label: "Currently Active", value: staffList.reduce((s, x) => s + x.active, 0), icon: Clock, color: "text-amber-500" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-3">
              <Icon className={cn("w-8 h-8", item.color)} />
              <div>
                <p className="text-xl font-black text-slate-800 dark:text-slate-200">{item.value}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{item.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {staffList.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-16 text-center">
          <Users className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">No staff members found</p>
        </div>
      ) : (
        <>
          {/* Top performers podium */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              Top Performers
            </h3>
            <div className="flex items-end justify-center gap-4">
              {staffList.slice(0, 3).map((staff, i) => {
                const heights = ["h-20", "h-28", "h-16"];
                const labels = ["🥈 2nd", "🥇 1st", "🥉 3rd"];
                const order = [1, 0, 2]; // display: 2nd, 1st, 3rd
                const s = staffList[order[i]];
                if (!s) return null;
                return (
                  <div key={s.id} className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                      {s.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 text-center max-w-[80px] truncate">{s.name}</p>
                    <p className={cn("text-sm font-black", ratingColor(s.completionRate))}>{s.completionRate}%</p>
                    <div
                      className={cn("w-16 rounded-t-xl bg-gradient-to-t", ratingBg(s.completionRate), heights[i])}
                    >
                      <p className="text-[10px] text-white font-bold text-center pt-1">{labels[i]}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Full table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">All Staff Performance</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Staff</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Active</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Completion Rate</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Time</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Reputation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {staffList.map((staff) => (
                    <tr key={staff.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {staff.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-700 dark:text-slate-300">{staff.name}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">{staff.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-700 dark:text-slate-300">{staff.totalAssigned}</td>
                      <td className="py-3.5 px-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">{staff.completed}</td>
                      <td className="py-3.5 px-4 text-right font-semibold text-amber-600 dark:text-amber-400">{staff.active}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden min-w-[60px]">
                            <div
                              className={cn("h-full rounded-full bg-gradient-to-r", ratingBg(staff.completionRate))}
                              style={{ width: `${staff.completionRate}%` }}
                            />
                          </div>
                          <span className={cn("text-xs font-bold w-10 text-right", ratingColor(staff.completionRate))}>
                            {staff.completionRate}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-500 dark:text-slate-400 text-xs">
                        {staff.avgResolutionHours > 0 ? `${staff.avgResolutionHours}h` : "—"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Star className="w-3 h-3 text-amber-400" />
                          <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">{staff.reputationScore}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
