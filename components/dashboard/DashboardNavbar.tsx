"use client";

import { Bell, Search, LogOut, Menu } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";

interface DashboardNavbarProps {
  title: string;
  onMenuClick?: () => void;
}

export function DashboardNavbar({ title, onMenuClick }: DashboardNavbarProps) {
  const { data: session } = useSession();
  const user = session?.user;

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between px-4 lg:px-6 gap-4 shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="font-semibold text-slate-800 dark:text-slate-200 text-base truncate">{title}</h1>
      </div>

      {/* Search (desktop) */}
      <div className="hidden md:flex flex-1 max-w-xs">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        <button className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-700 ml-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-none">{user?.name ?? "User"}</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 capitalize leading-none mt-0.5">{(user as { role?: string })?.role ?? "Member"}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-1"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
