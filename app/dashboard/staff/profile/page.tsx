"use client";

import useSWR from "swr";
import { useSession } from "next-auth/react";
import { Star, CheckCircle2, Clock, Award, Loader2, User } from "lucide-react";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function StarRating({ score }: { score: number }) {
  // Map reputation score to 5-star rating
  const stars = Math.min(5, Math.max(0, Math.round(score / 20)));
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn("w-5 h-5", i <= stars ? "text-amber-400 fill-amber-400" : "text-slate-200 dark:text-slate-700")}
        />
      ))}
    </div>
  );
}

export default function StaffProfilePage() {
  const { data: session } = useSession();
  const { data, isLoading } = useSWR("/api/dashboard/staff/history", fetcher);

  const user = data?.user ?? {};
  const assignments = data?.assignments ?? [];
  const sessionUser = session?.user as { name?: string; email?: string; role?: string } | undefined;

  const totalCompleted = assignments.length;
  const thisMonth = assignments.filter((a: { completedAt: string }) => {
    const d = new Date(a.completedAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const avgResolution = assignments.length > 0
    ? Math.round(assignments.reduce((s: number, a: { startedAt: string | null; completedAt: string }) => {
        if (!a.startedAt) return s;
        return s + (new Date(a.completedAt).getTime() - new Date(a.startedAt).getTime()) / 3_600_000;
      }, 0) / assignments.length)
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
      </div>
    );
  }

  const initials = (sessionUser?.name ?? "U").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Profile card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-24" />
        <div className="px-6 pb-6 -mt-10">
          <div className="flex items-end justify-between mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 border-4 border-white dark:border-slate-900 flex items-center justify-center text-white text-xl font-black shadow-lg">
              {initials}
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-xl">
              <User className="w-3.5 h-3.5" />
              Staff Member
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{sessionUser?.name ?? "Staff"}</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500">{sessionUser?.email}</p>
        </div>
      </div>

      {/* Reputation score */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-4 h-4 text-amber-400" />
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Reputation Score</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-5xl font-black text-slate-800 dark:text-slate-200">{user.reputationScore ?? 0}</div>
          <div>
            <StarRating score={user.reputationScore ?? 0} />
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Based on task completion and speed
            </p>
          </div>
        </div>
        <div className="mt-4 w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, user.reputationScore ?? 0)}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Completed", value: totalCompleted, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "Avg Resolution", value: avgResolution > 0 ? `${avgResolution}h` : "—", icon: Clock, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
          { label: "This Month", value: thisMonth, icon: Star, color: "text-sky-500", bg: "bg-sky-50 dark:bg-sky-900/20" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className={cn("rounded-2xl p-4 text-center", item.bg)}>
              <Icon className={cn("w-6 h-6 mx-auto mb-2", item.color)} />
              <p className="text-2xl font-black text-slate-800 dark:text-slate-200">{item.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
            </div>
          );
        })}
      </div>

      {/* Badges */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-4">Badges Earned</h3>
        <div className="flex flex-wrap gap-3">
          {totalCompleted >= 1 && (
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800">
              🎯 First Completion
            </div>
          )}
          {totalCompleted >= 10 && (
            <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-bold px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-800">
              ⭐ 10 Tasks Done
            </div>
          )}
          {avgResolution > 0 && avgResolution <= 2 && (
            <div className="flex items-center gap-2 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 text-xs font-bold px-3 py-2 rounded-xl border border-sky-200 dark:border-sky-800">
              ⚡ Speed Demon
            </div>
          )}
          {(user.reputationScore ?? 0) >= 80 && (
            <div className="flex items-center gap-2 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 text-xs font-bold px-3 py-2 rounded-xl border border-violet-200 dark:border-violet-800">
              🏆 Top Performer
            </div>
          )}
          {totalCompleted === 0 && (
            <p className="text-xs text-slate-400 dark:text-slate-500">Complete tasks to earn badges!</p>
          )}
        </div>
      </div>
    </div>
  );
}
