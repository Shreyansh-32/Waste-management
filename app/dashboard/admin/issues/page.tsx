"use client";

import useSWR from "swr";
import Link from "next/link";
import { useMemo, useState } from "react";
import { MapPin, Trash2, Loader2, Download, Search } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const statusOptions = ["ALL", "PENDING", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "REJECTED"] as const;
const priorityOptions = ["ALL", "LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
const categoryOptions = [
  "ALL",
  "WASHROOM",
  "CLASSROOM",
  "HOSTEL",
  "CANTEEN",
  "CORRIDOR",
  "LAB",
  "OUTDOOR",
  "OTHER",
] as const;

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

interface IssueListItem {
  id: string;
  title: string | null;
  description: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
  location: { name: string; type: string };
  reporter: { name: string } | null;
}

export default function AdminIssuesPage() {
  const [status, setStatus] = useState<(typeof statusOptions)[number]>("ALL");
  const [priority, setPriority] = useState<(typeof priorityOptions)[number]>("ALL");
  const [category, setCategory] = useState<(typeof categoryOptions)[number]>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const query = useMemo(() => {
    const params = new URLSearchParams();
    params.set("limit", "30");
    params.set("page", "1");
    if (status !== "ALL") params.set("status", status);
    if (priority !== "ALL") params.set("priority", priority);
    if (category !== "ALL") params.set("category", category);
    return params.toString();
  }, [status, priority, category]);

  const { data, isLoading, mutate } = useSWR(`/api/issues?${query}`, fetcher);
  const issues: IssueListItem[] = data?.issues ?? [];

  // Client-side search filtering
  const filteredIssues = useMemo(() => {
    if (!searchQuery.trim()) return issues;
    const query = searchQuery.toLowerCase();
    return issues.filter((issue) =>
      issue.title?.toLowerCase().includes(query) ||
      issue.description.toLowerCase().includes(query) ||
      issue.location.name.toLowerCase().includes(query) ||
      issue.reporter?.name.toLowerCase().includes(query)
    );
  }, [issues, searchQuery]);

  const exportToCSV = () => {
    const csvData = filteredIssues.map((issue) => ({
      ID: issue.id,
      Title: issue.title || "",
      Description: issue.description,
      Status: issue.status,
      Priority: issue.priority,
      Category: issue.category,
      Location: issue.location.name,
      "Location Type": issue.location.type,
      Reporter: issue.reporter?.name || "Anonymous",
      "Created At": new Date(issue.createdAt).toLocaleString(),
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) =>
        headers.map((header) => `"${String(row[header as keyof typeof row]).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `issues-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV exported successfully");
  };

  const updateStatus = async (id: string, nextStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/issues/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success("Status updated");
      mutate();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteIssue = async (id: string) => {
    if (!confirm("Delete this issue?")) return;
    try {
      const res = await fetch(`/api/issues/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Issue deleted");
      mutate();
    } catch {
      toast.error("Failed to delete issue");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Issues</h2>
            <p className="text-sm text-slate-400 dark:text-slate-500">Monitor and update reported issues.</p>
          </div>
          <button
            onClick={exportToCSV}
            disabled={filteredIssues.length === 0}
            className="ml-auto flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-4 py-2 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Search bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, description, location, or reporter..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as (typeof statusOptions)[number])}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-700 dark:text-slate-300"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s.replace("_", " ")}</option>
            ))}
          </select>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as (typeof priorityOptions)[number])}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-700 dark:text-slate-300"
          >
            {priorityOptions.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as (typeof categoryOptions)[number])}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-700 dark:text-slate-300"
          >
            {categoryOptions.map((c) => (
              <option key={c} value={c}>{c.replace("_", " ")}</option>
            ))}
          </select>
          {searchQuery && (
            <span className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 px-3 py-2">
              Found {filteredIssues.length} result{filteredIssues.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
        </div>
      ) : filteredIssues.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-16 text-center">
          <p className="text-slate-400 dark:text-slate-500 text-sm">
            {searchQuery ? "No issues match your search." : "No issues found."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredIssues.map((issue) => (
            <div
              key={issue.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
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
                  <Link href={`/dashboard/admin/issues/${issue.id}`} className="text-sm font-semibold text-slate-800 dark:text-slate-200 hover:underline">
                    {issue.title ?? issue.description.slice(0, 100)}
                  </Link>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    <MapPin className="inline w-3 h-3 mr-1" />
                    {issue.location.name} · Reported by {issue.reporter?.name ?? "Anonymous"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={issue.status}
                    onChange={(e) => updateStatus(issue.id, e.target.value)}
                    disabled={updatingId === issue.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-700 dark:text-slate-300"
                  >
                    {statusOptions.filter((s) => s !== "ALL").map((s) => (
                      <option key={s} value={s}>{s.replace("_", " ")}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => deleteIssue(issue.id)}
                    className="p-2 rounded-xl border border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Delete issue"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
