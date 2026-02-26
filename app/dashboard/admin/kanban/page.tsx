"use client";

import useSWR from "swr";
import { useState } from "react";
import { MapPin, User, AlertTriangle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const columns = [
  { key: "PENDING",     label: "Pending",     color: "amber" },
  { key: "ASSIGNED",    label: "Assigned",    color: "sky" },
  { key: "IN_PROGRESS", label: "In Progress", color: "violet" },
  { key: "REJECTED",    label: "Rejected",    color: "red" },
] as const;

const priorityColors: Record<string, string> = {
  LOW:      "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  MEDIUM:   "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  HIGH:     "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
  CRITICAL: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

const colHeaderColors: Record<string, string> = {
  amber:  "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  sky:    "bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800",
  violet: "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800",
  red:    "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
};

interface Issue {
  id: string;
  title?: string;
  description: string;
  priority: string;
  category: string;
  status: string;
  location: { name: string; type: string };
  reporter?: { name: string } | null;
  assignments: { staff: { id: string; name: string } }[];
  createdAt: string;
}

interface StaffMember {
  id: string;
  name: string;
  email: string;
}

export default function AdminKanbanPage() {
  const { data, isLoading, mutate } = useSWR("/api/dashboard/admin/kanban", fetcher, { refreshInterval: 15000 });
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const handleAssign = async (issueId: string, staffId: string) => {
    try {
      const res = await fetch("/api/dashboard/admin/kanban", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueId, staffId, newStatus: "ASSIGNED" }),
      });
      if (!res.ok) throw new Error();
      toast.success("Task assigned successfully");
      mutate();
    } catch {
      toast.error("Failed to assign task");
    } finally {
      setAssigningId(null);
    }
  };

  const handleStatusChange = async (issueId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/dashboard/admin/kanban", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueId, newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success("Status updated");
      mutate();
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 h-[calc(100vh-8rem)]">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse" />
        ))}
      </div>
    );
  }

  const issueColumns = data?.columns ?? {};
  const staffList: StaffMember[] = data?.staffList ?? [];

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col gap-4 max-w-full">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Drag-free kanban — use the assign dropdown to move issues between staff
        </p>
        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-lg">
          Auto-refreshes every 15s
        </span>
      </div>

      <div className="flex gap-4 flex-1 overflow-x-auto pb-4">
        {columns.map(({ key, label, color }) => {
          const issues: Issue[] = issueColumns[key] ?? [];
          return (
            <div key={key} className="flex flex-col min-w-[280px] w-[280px] bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              {/* Column header */}
              <div className={cn("px-4 py-3 border-b flex items-center justify-between", colHeaderColors[color])}>
                <span className="text-sm font-bold">{label}</span>
                <span className="text-xs font-bold bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded-full">
                  {issues.length}
                </span>
              </div>

              {/* Issues */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {issues.length === 0 && (
                  <div className="text-center py-8 text-slate-300 dark:text-slate-600 text-sm">
                    No issues
                  </div>
                )}
                {issues.map((issue) => (
                  <div
                    key={issue.id}
                    className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-3.5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Priority + category */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md", priorityColors[issue.priority])}>
                        {issue.priority}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                        {issue.category}
                      </span>
                    </div>

                    {/* Title */}
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1 leading-snug">
                      {issue.title ?? issue.description.slice(0, 80)}
                    </p>

                    {/* Location */}
                    <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 mb-3">
                      <MapPin className="w-3 h-3" />
                      {issue.location.name}
                    </div>

                    {/* Reporter */}
                    {issue.reporter && (
                      <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 mb-3">
                        <User className="w-3 h-3" />
                        {issue.reporter.name}
                      </div>
                    )}

                    {/* Current assignee */}
                    {issue.assignments.length > 0 && (
                      <div className="flex items-center gap-1.5 mb-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-2.5 py-1.5">
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[9px] font-bold">
                          {issue.assignments[0].staff.name[0]}
                        </div>
                        <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                          {issue.assignments[0].staff.name}
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {/* Assign staff */}
                      {key !== "REJECTED" && (
                        <div className="relative">
                          <select
                            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 appearance-none cursor-pointer focus:outline-none focus:border-emerald-400"
                            defaultValue=""
                            onChange={(e) => {
                              if (e.target.value) {
                                setAssigningId(issue.id);
                                handleAssign(issue.id, e.target.value);
                                e.target.value = "";
                              }
                            }}
                          >
                            <option value="" disabled>Assign to staff…</option>
                            {staffList.map((s) => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                        </div>
                      )}

                      {/* Status change */}
                      <div className="relative">
                        <select
                          className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 appearance-none cursor-pointer focus:outline-none focus:border-emerald-400"
                          value={issue.status}
                          onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="ASSIGNED">Assigned</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="RESOLVED">Resolved</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    {assigningId === issue.id && (
                      <p className="text-[10px] text-emerald-500 mt-1 text-center">Assigning…</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
