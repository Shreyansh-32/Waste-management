"use client";

import useSWR from "swr";
import { useMemo, useState } from "react";
import { Calendar, Loader2, MapPin, User } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const statusOptions = ["ALL", "active", "completed"] as const;

const priorityColors: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
  CRITICAL: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

interface AssignmentItem {
  id: string;
  assignedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  staff: { id: string; name: string };
  assignedBy: { name: string } | null;
  issue: {
    id: string;
    title: string | null;
    description: string;
    category: string;
    priority: string;
    location: { name: string; type: string };
  };
}

interface StaffMember {
  id: string;
  name: string;
  email: string;
}

interface IssueOption {
  id: string;
  title: string | null;
  description: string;
  priority: string;
  location: { name: string };
}

export default function AdminAssignmentsPage() {
  const [status, setStatus] = useState<(typeof statusOptions)[number]>("ALL");
  const [issueId, setIssueId] = useState("");
  const [staffId, setStaffId] = useState("");
  const [creating, setCreating] = useState(false);

  const query = useMemo(() => {
    if (status === "ALL") return "";
    return `?status=${status}`;
  }, [status]);

  const { data, isLoading, mutate } = useSWR(`/api/assignments${query}`, fetcher);
  const { data: staffData } = useSWR("/api/dashboard/admin/kanban", fetcher);
  const { data: issueData } = useSWR("/api/issues?status=PENDING&limit=50", fetcher);

  const assignments: AssignmentItem[] = data?.assignments ?? [];
  const staffList: StaffMember[] = staffData?.staffList ?? [];
  const issues: IssueOption[] = issueData?.issues ?? [];

  const createAssignment = async () => {
    if (!issueId || !staffId) {
      toast.error("Select issue and staff member");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueId, staffId }),
      });
      if (!res.ok) throw new Error();
      toast.success("Assignment created");
      setIssueId("");
      setStaffId("");
      mutate();
    } catch {
      toast.error("Failed to create assignment");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Create Assignment</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500">Assign pending issues to staff.</p>
          <div className="grid gap-3 mt-4">
            <select
              value={issueId}
              onChange={(e) => setIssueId(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-300"
            >
              <option value="">Select issue</option>
              {issues.map((issue) => (
                <option key={issue.id} value={issue.id}>
                  {issue.title ?? issue.description.slice(0, 50)} · {issue.location.name}
                </option>
              ))}
            </select>
            <select
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-300"
            >
              <option value="">Select staff</option>
              {staffList.map((staff) => (
                <option key={staff.id} value={staff.id}>{staff.name}</option>
              ))}
            </select>
            <button
              onClick={createAssignment}
              disabled={creating}
              className="rounded-xl bg-emerald-600 text-white px-4 py-2 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60"
            >
              {creating ? "Assigning..." : "Assign task"}
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Filter</h3>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as (typeof statusOptions)[number])}
            className="mt-3 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-300"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s === "ALL" ? "All" : s}</option>
            ))}
          </select>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
            Use this to separate active vs completed assignments.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
        </div>
      ) : assignments.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-16 text-center">
          <p className="text-sm text-slate-400 dark:text-slate-500">No assignments found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-lg", priorityColors[assignment.issue.priority])}>
                      {assignment.issue.priority}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {assignment.issue.category}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {assignment.issue.title ?? assignment.issue.description.slice(0, 100)}
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-400 dark:text-slate-500 mt-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {assignment.issue.location.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {assignment.staff.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(assignment.assignedAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400">
                  <p>Status: {assignment.completedAt ? "Completed" : assignment.startedAt ? "In progress" : "Assigned"}</p>
                  {assignment.assignedBy?.name && <p>Assigned by {assignment.assignedBy.name}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
