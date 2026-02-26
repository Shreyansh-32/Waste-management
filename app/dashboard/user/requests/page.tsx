"use client";

import useSWR from "swr";
import { useState } from "react";
import { MapPin, Calendar, Edit2, CheckCircle2, Clock, AlertTriangle, Loader2, X, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  PENDING:     { label: "Pending",     className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",    icon: Clock },
  ASSIGNED:    { label: "Assigned",    className: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400",            icon: Clock },
  IN_PROGRESS: { label: "In Progress", className: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400", icon: Clock },
  RESOLVED:    { label: "Resolved",    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400", icon: CheckCircle2 },
  REJECTED:    { label: "Rejected",    className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",            icon: AlertTriangle },
};

const priorityConfig: Record<string, string> = {
  LOW:      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  MEDIUM:   "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  HIGH:     "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
  CRITICAL: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

interface Issue {
  id: string;
  title: string | null;
  description: string;
  category: string;
  status: string;
  priority: string;
  createdAt: string;
  location: { name: string; type: string };
  assignments: { staff: { name: string } }[];
}

export default function UserRequestsPage() {
  const { data, isLoading, mutate } = useSWR("/api/dashboard/user/requests", fetcher, { refreshInterval: 30000 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ title: string; description: string; priority: string }>({ title: "", description: "", priority: "MEDIUM" });
  const [saving, setSaving] = useState(false);

  const startEdit = (issue: Issue) => {
    setEditingId(issue.id);
    setEditForm({
      title: issue.title ?? "",
      description: issue.description,
      priority: issue.priority,
    });
  };

  const saveEdit = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/user/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...editForm }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      toast.success("Request updated");
      setEditingId(null);
      mutate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const issues: Issue[] = data?.issues ?? [];
  const active = issues.filter((i) => !["RESOLVED", "REJECTED"].includes(i.status));
  const past = issues.filter((i) => ["RESOLVED", "REJECTED"].includes(i.status));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
      </div>
    );
  }

  const IssueCard = ({ issue }: { issue: Issue }) => {
    const status = statusConfig[issue.status] ?? statusConfig.PENDING;
    const StatusIcon = status.icon;
    const isEditing = editingId === issue.id;
    const canEdit = issue.status === "PENDING";

    return (
      <div className={cn(
        "bg-white dark:bg-slate-900 rounded-2xl border shadow-sm overflow-hidden transition-all",
        isEditing ? "border-emerald-300 dark:border-emerald-700" : "border-slate-200 dark:border-slate-800"
      )}>
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={cn("text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-1", status.className)}>
                  <StatusIcon className="w-3 h-3" />
                  {status.label}
                </span>
                <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-lg", priorityConfig[issue.priority])}>
                  {issue.priority}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                  {issue.category}
                </span>
              </div>

              {isEditing ? (
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="Issue title"
                  className="w-full text-sm font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-400"
                />
              ) : (
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {issue.title ?? issue.description.slice(0, 80)}
                </h3>
              )}
            </div>

            {canEdit && !isEditing && (
              <button
                onClick={() => startEdit(issue)}
                className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                title="Edit (only available while Pending)"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}

            {isEditing && (
              <button
                onClick={() => setEditingId(null)}
                className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Description */}
          {isEditing ? (
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              rows={3}
              className="w-full mb-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-400 resize-none"
            />
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 leading-relaxed line-clamp-2">
              {issue.description}
            </p>
          )}

          {/* Priority selector (edit mode) */}
          {isEditing && (
            <div className="mb-3">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Priority</label>
              <div className="flex gap-2">
                {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setEditForm({ ...editForm, priority: p })}
                    className={cn(
                      "text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all",
                      editForm.priority === p
                        ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                        : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {issue.location.name}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(issue.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
            {issue.assignments.length > 0 && (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                Assigned to {issue.assignments[0].staff.name}
              </span>
            )}
          </div>

          {/* Edit actions */}
          {isEditing && (
            <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => saveEdit(issue.id)}
                disabled={saving}
                className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-4 py-2 rounded-xl transition-colors"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Changes
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {issues.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-16 text-center">
          <AlertTriangle className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="font-semibold text-slate-700 dark:text-slate-300">No requests yet</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Report a campus issue to get started</p>
        </div>
      ) : (
        <>
          {/* Active requests */}
          {active.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Active Requests ({active.length})
              </h3>
              <div className="space-y-3">
                {active.map((issue) => <IssueCard key={issue.id} issue={issue} />)}
              </div>
            </div>
          )}

          {/* Past requests */}
          {past.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Past Requests ({past.length})
              </h3>
              <div className="space-y-3 opacity-80">
                {past.map((issue) => <IssueCard key={issue.id} issue={issue} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
