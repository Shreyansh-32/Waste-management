"use client";

import useSWR from "swr";
import { useState } from "react";
import { MapPin, Calendar, Play, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const priorityConfig: Record<string, { label: string; className: string }> = {
  LOW:      { label: "Low",      className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
  MEDIUM:   { label: "Medium",   className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" },
  HIGH:     { label: "High",     className: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400" },
  CRITICAL: { label: "Critical", className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" },
};

interface Assignment {
  id: string;
  assignedAt: string;
  startedAt: string | null;
  assignedBy: { name: string } | null;
  issue: {
    id: string;
    title: string | null;
    description: string;
    category: string;
    priority: string;
    status: string;
    location: { name: string; type: string };
    photos: { url: string }[];
  };
}

export default function StaffTasksPage() {
  const { data, isLoading, mutate } = useSWR("/api/dashboard/staff/tasks", fetcher, { refreshInterval: 20000 });
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleStart = async (assignmentId: string) => {
    try {
      await fetch("/api/dashboard/staff/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId, action: "start" }),
      });
      toast.success("Task started");
      mutate();
    } catch {
      toast.error("Failed to start task");
    }
  };

  const handleComplete = async (assignmentId: string) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/dashboard/staff/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId, action: "complete", completionNote: note }),
      });
      if (!res.ok) throw new Error();
      toast.success("Task completed!");
      setCompletingId(null);
      setNote("");
      mutate();
    } catch {
      toast.error("Failed to complete task");
    } finally {
      setSubmitting(false);
    }
  };

  const assignments: Assignment[] = data?.assignments ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {assignments.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-16 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
          <p className="font-semibold text-slate-700 dark:text-slate-300">All caught up!</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">No tasks assigned to you right now</p>
        </div>
      ) : (
        assignments.map((assignment) => {
          const issue = assignment.issue;
          const priority = priorityConfig[issue.priority] ?? priorityConfig.MEDIUM;
          const isStarted = !!assignment.startedAt;
          const isCompleting = completingId === assignment.id;

          return (
            <div
              key={assignment.id}
              className={cn(
                "bg-white dark:bg-slate-900 rounded-2xl border shadow-sm overflow-hidden",
                issue.priority === "CRITICAL"
                  ? "border-red-200 dark:border-red-800/50"
                  : "border-slate-200 dark:border-slate-800"
              )}
            >
              {/* Priority banner for critical */}
              {issue.priority === "CRITICAL" && (
                <div className="bg-red-500 px-4 py-1.5 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-white" />
                  <span className="text-xs font-bold text-white">Critical Priority — Immediate Attention Required</span>
                </div>
              )}

              <div className="p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={cn("text-xs font-bold px-2 py-0.5 rounded-lg", priority.className)}>
                        {priority.label}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        {issue.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                      {issue.title ?? issue.description.slice(0, 100)}
                    </h3>
                  </div>
                  <div className={cn(
                    "shrink-0 text-xs font-semibold px-2.5 py-1 rounded-lg",
                    isStarted
                      ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                  )}>
                    {isStarted ? "In Progress" : "Assigned"}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 dark:text-slate-500 mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {issue.location.name} ({issue.location.type})
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Assigned {new Date(assignment.assignedAt).toLocaleDateString("en-IN")}
                  </div>
                  {assignment.assignedBy && (
                    <span>by {assignment.assignedBy.name}</span>
                  )}
                </div>

                {/* Completion note input */}
                {isCompleting && (
                  <div className="mb-4 space-y-2">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Completion Note</label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Describe what was done…"
                      rows={3}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-500 resize-none"
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {!isStarted && !isCompleting && (
                    <button
                      onClick={() => handleStart(assignment.id)}
                      className="flex items-center gap-1.5 text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Start Task
                    </button>
                  )}

                  {!isCompleting && (
                    <button
                      onClick={() => setCompletingId(assignment.id)}
                      className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark Complete
                    </button>
                  )}

                  {isCompleting && (
                    <>
                      <button
                        onClick={() => handleComplete(assignment.id)}
                        disabled={submitting}
                        className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-4 py-2 rounded-xl transition-colors"
                      >
                        {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        Confirm Complete
                      </button>
                      <button
                        onClick={() => { setCompletingId(null); setNote(""); }}
                        className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
