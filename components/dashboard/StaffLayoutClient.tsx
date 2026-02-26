"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { StaffSidebar } from "@/components/dashboard/StaffSidebar";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";

const pageTitles: Record<string, string> = {
  "/dashboard/staff/tasks": "My Assigned Tasks",
  "/dashboard/staff/history": "Task History",
  "/dashboard/staff/profile": "My Profile",
  "/dashboard/staff/notifications": "Notifications",
};

export default function StaffLayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "Staff Dashboard";

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <StaffSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <DashboardNavbar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
