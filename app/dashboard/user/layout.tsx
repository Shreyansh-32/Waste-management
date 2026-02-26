"use client";

import { useState } from "react";
import { UserSidebar } from "@/components/dashboard/UserSidebar";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/dashboard/user/requests": "My Requests",
};

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "My Dashboard";

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <UserSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <DashboardNavbar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
