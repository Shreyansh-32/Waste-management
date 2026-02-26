"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Leaf, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "My Requests", href: "/dashboard/user/requests", icon: FileText },
];

interface UserSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function UserSidebar({ open, onClose }: UserSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out",
          "lg:static lg:translate-x-0 lg:z-auto",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-md shadow-emerald-200 dark:shadow-emerald-900/50">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">Smart<span className="text-emerald-600">Campus</span></span>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-none">My Dashboard</p>
            </div>
          </Link>
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600 px-3 py-2">My Space</p>
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-800 dark:hover:text-slate-200"
                )}
              >
                <Icon className={cn("w-4 h-4 shrink-0", active ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500")} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="bg-violet-50 dark:bg-violet-900/20 rounded-xl p-3">
            <p className="text-xs font-semibold text-violet-700 dark:text-violet-400">Campus Member</p>
            <p className="text-[11px] text-violet-600/70 dark:text-violet-500/70 mt-0.5">Report & track issues</p>
          </div>
        </div>
      </aside>
    </>
  );
}
