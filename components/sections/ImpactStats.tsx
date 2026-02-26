"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Zap, Users, Eye, Clock } from "lucide-react";

function useCountUp(target: number, duration: number, start: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);

  return value;
}

interface StatCardProps {
  icon: React.ElementType;
  prefix?: string;
  value: number;
  suffix: string;
  label: string;
  sublabel: string;
  start: boolean;
  gradient: string;
}

function StatCard({ icon: Icon, prefix = "", value, suffix, label, sublabel, start, gradient }: StatCardProps) {
  const count = useCountUp(value, 1800, start);

  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="group relative bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-100 hover:border-emerald-200 transition-all duration-300 text-center overflow-hidden"
    >
      {/* Background glow */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-3xl`} />

      {/* Icon */}
      <div className={`w-14 h-14 mx-auto mb-5 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
        <Icon className="w-7 h-7 text-white" />
      </div>

      {/* Number */}
      <div className="flex items-baseline justify-center gap-1 mb-2">
        <span className="text-slate-400 text-2xl font-bold">{prefix}</span>
        <span className="text-5xl font-black text-slate-900 tabular-nums">{count}</span>
        <span className={`text-2xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
          {suffix}
        </span>
      </div>

      <h3 className="font-bold text-slate-800 text-lg mb-1">{label}</h3>
      <p className="text-slate-400 text-sm">{sublabel}</p>
    </motion.div>
  );
}

const stats = [
  {
    icon: Zap,
    value: 40,
    suffix: "%",
    label: "Faster Resolution",
    sublabel: "Average time from report to resolved",
    gradient: "from-emerald-400 to-emerald-600",
  },
  {
    icon: Users,
    value: 3,
    suffix: "x",
    label: "Better Staff Allocation",
    sublabel: "More efficient deployment per shift",
    gradient: "from-teal-400 to-emerald-600",
  },
  {
    icon: Eye,
    value: 100,
    suffix: "%",
    label: "Transparent Tracking",
    sublabel: "Complete audit trail for every report",
    gradient: "from-lime-400 to-green-600",
  },
  {
    icon: Clock,
    value: 24,
    suffix: "/7",
    label: "Real-Time Monitoring",
    sublabel: "Always-on campus cleanliness watch",
    gradient: "from-green-400 to-emerald-600",
  },
];

export default function ImpactStats() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/30 via-white to-white pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-xl mx-auto mb-16"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 mb-4 block">
            Proven Impact
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-5 leading-tight">
            Numbers that{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-lime-500 bg-clip-text text-transparent">
              speak for themselves
            </span>
          </h2>
          <p className="text-slate-500 text-lg">
            Real outcomes from campuses already running our platform.
          </p>
        </motion.div>

        <div
          ref={ref}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <StatCard {...stat} start={isInView} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
