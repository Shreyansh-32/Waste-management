"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { TrendingUp, MapPin, Zap, LayoutDashboard } from "lucide-react";

const weekData = [
  { day: "Mon", score: 72, issues: 8 },
  { day: "Tue", score: 78, issues: 5 },
  { day: "Wed", score: 65, issues: 11 },
  { day: "Thu", score: 82, issues: 4 },
  { day: "Fri", score: 88, issues: 2 },
  { day: "Sat", score: 91, issues: 1 },
  { day: "Sun", score: 87, issues: 3 },
];

const heatCells = [
  [1, 2, 3, 1, 0, 1, 2],
  [3, 5, 4, 2, 1, 0, 1],
  [2, 4, 8, 5, 2, 1, 0],
  [1, 3, 5, 3, 1, 0, 1],
  [0, 1, 2, 1, 0, 0, 0],
];

const heatColor = (v: number) => {
  if (v === 0) return "bg-emerald-900/30";
  if (v <= 2) return "bg-emerald-600/50";
  if (v <= 4) return "bg-yellow-400/70";
  if (v <= 6) return "bg-orange-400/80";
  return "bg-red-500/90";
};

export default function AnalyticsPreview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const maxScore = Math.max(...weekData.map((d) => d.score));

  return (
    <section id="analytics" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-emerald-50/20 to-white pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 mb-4 block">
            Analytics Dashboard
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-5 leading-tight">
            Data that drives{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-lime-500 bg-clip-text text-transparent">
              real decisions
            </span>
          </h2>
          <p className="text-slate-500 text-lg leading-relaxed">
            Live insights across every zone, every shift. Optimize resources
            and predict issues before they escalate.
          </p>
        </motion.div>

        {/* Dashboard mockup */}
        <motion.div
          ref={ref}
          animate={isInView ? { y: [0, -10, 0] } : {}}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="relative max-w-5xl mx-auto"
        >
          <div className="bg-white rounded-3xl shadow-2xl shadow-emerald-100/60 border border-emerald-100 overflow-hidden">
            {/* Dashboard header bar */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  {["bg-red-400", "bg-yellow-400", "bg-green-400"].map((c, i) => (
                    <div key={i} className={`w-3 h-3 rounded-full ${c}`} />
                  ))}
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
                  <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-white/80 text-xs font-medium">campus-monitor.app/analytics</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-emerald-400 text-xs font-semibold">Live</span>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              {/* Left: Heatmap */}
              <div className="p-6 col-span-1">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-slate-800 text-sm">Campus Heatmap</h4>
                  <MapPin className="w-4 h-4 text-emerald-500" />
                </div>

                {/* Grid heatmap */}
                <div className="flex flex-col gap-1.5 mb-4">
                  {heatCells.map((row, ri) => (
                    <div key={ri} className="flex gap-1.5">
                      {row.map((val, ci) => (
                        <motion.div
                          key={ci}
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={isInView ? { opacity: 1, scale: 1 } : {}}
                          transition={{ delay: (ri * 7 + ci) * 0.02 + 0.4 }}
                          className={`flex-1 aspect-square rounded-md ${heatColor(val)}`}
                          title={`Zone ${ri}-${ci}: ${val} issues`}
                        />
                      ))}
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400">Low</span>
                  {["bg-emerald-600/50", "bg-yellow-400/70", "bg-orange-400/80", "bg-red-500/90"].map((c, i) => (
                    <div key={i} className={`w-4 h-3 rounded-sm ${c}`} />
                  ))}
                  <span className="text-[10px] text-slate-400">High</span>
                </div>

                {/* Zone labels */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {[
                    { zone: "Cafeteria", risk: "High" },
                    { zone: "Library", risk: "Low" },
                    { zone: "Washrooms", risk: "Med" },
                    { zone: "Gym", risk: "Low" },
                  ].map((z) => (
                    <div key={z.zone} className="bg-slate-50 rounded-lg p-2">
                      <p className="text-[10px] font-semibold text-slate-600">{z.zone}</p>
                      <p className={`text-[10px] font-bold ${z.risk === "High" ? "text-red-500" : z.risk === "Med" ? "text-amber-500" : "text-emerald-600"}`}>
                        {z.risk} risk
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Middle: Weekly trend */}
              <div className="p-6 col-span-1">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-slate-800 text-sm">Weekly Score Trend</h4>
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                </div>

                {/* Bar chart */}
                <div className="flex items-end gap-2 h-36 mb-3">
                  {weekData.map((d, i) => (
                    <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={isInView ? { height: `${(d.score / 100) * 100}%` } : {}}
                        transition={{ duration: 0.6, delay: 0.5 + i * 0.08, ease: "easeOut" }}
                        className={`w-full rounded-t-lg ${i === weekData.length - 1 ? "bg-gradient-to-t from-emerald-600 to-emerald-400" : "bg-emerald-200"}`}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 justify-between">
                  {weekData.map((d) => (
                    <div key={d.day} className="flex-1 text-center text-[10px] text-slate-400 font-medium">
                      {d.day}
                    </div>
                  ))}
                </div>

                {/* Score badge */}
                <div className="mt-4 bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">7-day average</p>
                    <p className="text-2xl font-black text-slate-800">80.4</p>
                  </div>
                  <div className="flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1.5 rounded-full">
                    <TrendingUp className="w-3 h-3" />
                    +12%
                  </div>
                </div>
              </div>

              {/* Right: KPIs */}
              <div className="p-6 col-span-1">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-slate-800 text-sm">Key Metrics</h4>
                  <Zap className="w-4 h-4 text-emerald-500" />
                </div>

                <div className="flex flex-col gap-3">
                  {[
                    { label: "Issues Reported", val: 34, max: 50, unit: "this week" },
                    { label: "Resolution Rate", val: 91, max: 100, unit: "%" },
                    { label: "Staff Utilization", val: 78, max: 100, unit: "%" },
                    { label: "Avg Response Time", val: 18, max: 60, unit: "min" },
                  ].map((m) => (
                    <div key={m.label}>
                      <div className="flex justify-between items-baseline mb-1.5">
                        <span className="text-xs text-slate-500">{m.label}</span>
                        <span className="text-sm font-bold text-slate-800">
                          {m.val}
                          <span className="text-xs text-slate-400 font-normal ml-0.5">{m.unit}</span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={isInView ? { width: `${(m.val / m.max) * 100}%` } : {}}
                          transition={{ duration: 0.8, delay: 0.6 }}
                          className="h-2 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Alert */}
                <div className="mt-5 bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-xs font-bold text-amber-700 mb-0.5">⚠ Attention Required</p>
                  <p className="text-[11px] text-amber-600">Cafeteria Block C — 3 unresolved reports &gt;2 hrs</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
