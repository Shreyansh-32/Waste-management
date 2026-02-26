"use client";

import useSWR from "swr";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Calendar, Loader2, MapPin, ThumbsUp } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { PhotoViewer } from "@/components/PhotoViewer";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

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

export default function UserIssueDetailPage() {
  const params = useParams<{ id: string }>();
  const issueId = params.id;
  const { data, isLoading, mutate } = useSWR(`/api/issues/${issueId}`, fetcher);
  const issue = data?.issue;

  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  const hasVoted = useMemo(() => (issue?.votes?.length ?? 0) > 0, [issue?.votes]);

  const openPhotoViewer = (index: number) => {
    setSelectedPhotoIndex(index);
    setPhotoViewerOpen(true);
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
            </div>
          </div>

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
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Photos</h3>
        {issue.photos?.length ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {issue.photos.map((photo: { id: string; url: string }, index: number) => (
                <button
                  key={photo.id}
                  onClick={() => openPhotoViewer(index)}
                  className="relative h-28 w-full rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden group cursor-pointer"
                >
                  <img
                    src={photo.url}
                    alt={`Issue photo ${index + 1}`}
                    className="h-full w-full object-cover transition-transform group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-semibold bg-black/50 px-2 py-1 rounded">
                      View
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <PhotoViewer
              photos={issue.photos.map((p: { url: string }) => p.url)}
              initialIndex={selectedPhotoIndex}
              isOpen={photoViewerOpen}
              onClose={() => setPhotoViewerOpen(false)}
            />
          </>
        ) : (
          <p className="text-xs text-slate-400 dark:text-slate-500">No photos uploaded.</p>
        )}
      </div>
    </div>
  );
}
