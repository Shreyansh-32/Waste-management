"use client";

import useSWR from "swr";
import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Calendar, Loader2, MapPin, ThumbsUp, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const statusOptions = ["PENDING", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "REJECTED"] as const;
const priorityOptions = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  ASSIGNED: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400",
  IN_PROGRESS: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
  RESOLVED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

const priorityColors: Record<string, string> = {
  LOW: "text-slate-400",
  MEDIUM: "text-amber-500",
  HIGH: "text-orange-500",
  CRITICAL: "text-red-500",
};

export default function AdminIssueDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const issueId = params.id;

  const { data, isLoading, mutate } = useSWR(`/api/issues/${issueId}`, fetcher);
  const issue = data?.issue;
  const [updating, setUpdating] = useState(false);

  const hasVoted = useMemo(() => (issue?.votes?.length ?? 0) > 0, [issue?.votes]);

  const updateIssue = async (payload: { status?: string; priority?: string }) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/issues/${issueId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      toast.success("Issue updated");
      mutate();
    } catch {
      toast.error("Failed to update issue");
    } finally {
      setUpdating(false);
    }
  };

  const toggleVote = async () => {
    try {
      const res = await fetch(`/api/issues/${issueId}/vote`, { method: "POST" });
      if (!res.ok) throw new Error();
      mutate();
    } catch {
      toast.error("Unable to vote");
    }
  };

  const deleteIssue = async () => {
    if (!confirm("Delete this issue?")) return;
    try {
      const res = await fetch(`/api/issues/${issueId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Issue deleted");
      router.push("/dashboard/admin/issues");
    } catch {
      toast.error("Failed to delete issue");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center">
        <p className="text-sm text-slate-400 dark:text-slate-500">Issue not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-lg", statusColors[issue.status])}>
                {issue.status.replace("_", " ")}
              </span>
              <span className={cn("text-[10px] font-semibold", priorityColors[issue.priority])}>
                {issue.priority}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                {issue.category}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
              {issue.title ?? issue.description.slice(0, 120)}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {issue.description}
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-slate-400 dark:text-slate-500 mt-4">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {issue.location?.name}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(issue.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </span>
              <span>Reported by {issue.reporter?.name ?? "Anonymous"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleVote}
              className={cn(
                "flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border",
                hasVoted
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-300"
                  : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300"
              )}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              {issue._count?.votes ?? 0}
            </button>
            <button
              onClick={deleteIssue}
              className="p-2 rounded-xl border border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              title="Delete issue"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-2">Status</p>
          <select
            value={issue.status}
            onChange={(e) => updateIssue({ status: e.target.value })}
            disabled={updating}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-300"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s.replace("_", " ")}</option>
            ))}
          </select>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-2">Priority</p>
          <select
            value={issue.priority}
            onChange={(e) => updateIssue({ priority: e.target.value })}
            disabled={updating}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-300"
          >
            {priorityOptions.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-2">Votes</p>
          <p className="text-2xl font-black text-slate-800 dark:text-slate-200">
            {issue._count?.votes ?? 0}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Photos</h3>
        {issue.photos?.length ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {issue.photos.map((photo: { id: string; url: string }) => (
              <img
                key={photo.id}
                src={photo.url}
                alt="Issue"
                className="h-28 w-full object-cover rounded-xl border border-slate-200 dark:border-slate-800"
              />
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 dark:text-slate-500">No photos uploaded.</p>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Status History</h3>
        </div>
        {issue.statusHistory?.length ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {issue.statusHistory.map((entry: { id: string; fromStatus: string | null; toStatus: string; note?: string | null; createdAt: string; changedBy?: { name?: string | null } | null }) => (
              <div key={entry.id} className="px-5 py-3 text-sm text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {entry.fromStatus ? entry.fromStatus.replace("_", " ") : "New"} → {entry.toStatus.replace("_", " ")}
                </span>
                {entry.note && <span className="ml-2 text-xs text-slate-400">{entry.note}</span>}
                <div className="text-xs text-slate-400 mt-1">
                  {new Date(entry.createdAt).toLocaleString("en-IN")} · {entry.changedBy?.name ?? "System"}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-6 text-xs text-slate-400 dark:text-slate-500">No history yet.</div>
        )}
      </div>
    </div>
  );
}
