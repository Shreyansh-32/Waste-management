import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  color?: "emerald" | "amber" | "red" | "sky" | "violet";
  className?: string;
}

const colorMap = {
  emerald: {
    icon: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400",
    trend: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30",
  },
  amber: {
    icon: "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400",
    trend: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30",
  },
  red: {
    icon: "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400",
    trend: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30",
  },
  sky: {
    icon: "bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400",
    trend: "text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/30",
  },
  violet: {
    icon: "bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400",
    trend: "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30",
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "emerald",
  className,
}: StatCardProps) {
  const colors = colorMap[color];

  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow duration-200",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", colors.icon)}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={cn("text-xs font-semibold px-2 py-1 rounded-lg", colors.trend)}>
            {trend.value > 0 ? "+" : ""}{trend.value}% {trend.label}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">{value}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{title}</p>
        {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
