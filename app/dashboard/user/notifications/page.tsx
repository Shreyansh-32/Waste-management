"use client";

import useSWR from "swr";
import { useState } from "react";
import { Bell, Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface NotificationItem {
  id: string;
  message: string;
  type: string;
  createdAt: string;
  readAt: string | null;
  issue?: {
    id: string;
    title: string | null;
    description: string;
    status: string;
    location?: { name: string } | null;
  } | null;
}

export default function UserNotificationsPage() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const query = unreadOnly ? "?unreadOnly=true" : "";
  const { data, isLoading, mutate } = useSWR(`/api/notifications${query}`, fetcher);

  const notifications: NotificationItem[] = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const markAllRead = async () => {
    try {
      const res = await fetch("/api/notifications", { method: "PATCH" });
      if (!res.ok) throw new Error();
      toast.success("All notifications marked read");
      mutate();
    } catch {
      toast.error("Failed to mark all read");
    }
  };

  const markRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: "PATCH" });
      if (!res.ok) throw new Error();
      mutate();
    } catch {
      toast.error("Failed to mark read");
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      mutate();
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-wrap items-center gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Notifications</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500">{unreadCount} unread notifications</p>
        </div>
        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => setUnreadOnly((prev) => !prev)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs text-slate-700 dark:text-slate-300"
          >
            {unreadOnly ? "Show all" : "Unread only"}
          </button>
          <button
            onClick={markAllRead}
            className="rounded-xl bg-emerald-600 text-white px-4 py-2 text-xs font-semibold hover:bg-emerald-700"
          >
            Mark all read
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-16 text-center">
          <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400 dark:text-slate-500">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={cn(
                "bg-white dark:bg-slate-900 rounded-2xl border p-4 flex items-start gap-3",
                n.readAt ? "border-slate-200 dark:border-slate-800" : "border-emerald-200 dark:border-emerald-800/60"
              )}
            >
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", n.readAt ? "bg-slate-100 dark:bg-slate-800" : "bg-emerald-100 dark:bg-emerald-900/40")}>
                <Bell className={cn("w-4 h-4", n.readAt ? "text-slate-400" : "text-emerald-600")}/>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 dark:text-slate-300">{n.message}</p>
                {n.issue && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    {n.issue.title ?? n.issue.description.slice(0, 60)} · {n.issue.location?.name ?? "Unknown"}
                  </p>
                )}
                <p className="text-[10px] text-slate-400 mt-1">
                  {new Date(n.createdAt).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="flex gap-2">
                {!n.readAt && (
                  <button
                    onClick={() => markRead(n.id)}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300"
                  >
                    Mark read
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(n.id)}
                  className="rounded-xl border border-red-200 dark:border-red-800 text-red-500 p-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
