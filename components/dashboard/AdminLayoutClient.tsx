"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/dashboard/AdminSidebar";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";

const pageTitles: Record<string, string> = {
  "/dashboard/admin/overview": "Overview",
  "/dashboard/admin/kanban": "Kanban Board",
  "/dashboard/admin/heatmap": "Location Heatmap",
  "/dashboard/admin/recommendations": "Recommendations",
  "/dashboard/admin/analytics": "Analytics",
  "/dashboard/admin/staff": "Staff Performance",
  "/dashboard/admin/issues": "Issues",
  "/dashboard/admin/assignments": "Assignments",
  "/dashboard/admin/locations": "Locations",
  "/dashboard/admin/notifications": "Notifications",
  "/dashboard/admin/trends": "Trends",
};

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "Admin Dashboard";

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <DashboardNavbar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
