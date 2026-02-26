"use client";

import { motion, type Variants } from "motion/react";
import {
  AlertCircle, LayoutDashboard, CheckCircle2, Clock, Wifi, MapPin,
} from "lucide-react";
import Link from "next/link";

interface HeroProps {
  user?: {
    name?:  string | null;
    email?: string | null;
    role?:  string;
    id?:    string;
  } | null;
}

// Fix: cubic-bezier array must be typed as a const tuple, not number[]
const EASE = [0.25, 0.46, 0.45, 0.94] as const;

const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: EASE },
  }),
};

const statusItems = [
  { label: "Block A – Washrooms",    status: "Resolved",    color: "emerald" },
  { label: "Library – Bin Overflow",  status: "In Progress", color: "amber"   },
  { label: "Cafeteria – Spill",       status: "Reported",    color: "sky"      },
];

export default function Hero({ user }: HeroProps) {
  const isSignedIn = Boolean(user);
  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden">
      <div className="absolute inset-0 bg-grid pointer-events-none" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-emerald-300/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-lime-200/30 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* LEFT */}
          <div className="flex flex-col gap-6 lg:gap-8">

            {/* Live badge */}
            <motion.div
              custom={0} initial="hidden" animate="visible" variants={fadeUp}
              className="inline-flex w-fit items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-4 py-2 rounded-full"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Smart City Infrastructure · Live System
            </motion.div>

            {/* Personalised welcome card (signed-in only) */}
            {isSignedIn && (
              <motion.div
                custom={0.5} initial="hidden" animate="visible" variants={fadeUp}
                className="inline-flex w-fit items-center gap-3 bg-white/80 border border-emerald-100 rounded-2xl px-4 py-3 shadow-sm"
              >
                <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Welcome back, {user?.name?.split(" ")[0] ?? "there"}!
                  </p>
                  <p className="text-xs text-slate-400 capitalize">
                    {user?.role ?? "Campus Member"} · {user?.email}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Headline */}
            <motion.h1
              custom={1} initial="hidden" animate="visible" variants={fadeUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-slate-50 leading-[1.1] tracking-tight"
            >
              Smarter Cleanliness.{" "}
              <span className="relative inline-block">
                <span className="bg-linear-to-r from-emerald-500 to-lime-500 bg-clip-text text-transparent">
                  Healthier
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M2 8 C60 3,120 10,180 6 C240 2,280 9,298 7" stroke="url(#ug)" strokeWidth="3" strokeLinecap="round" />
                  <defs>
                    <linearGradient id="ug" x1="0" y1="0" x2="300" y2="0">
                      <stop stopColor="#22c55e" /><stop offset="1" stopColor="#a3e635" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>{" "}
              Campuses.
            </motion.h1>

            {/* Sub */}
            <motion.p
              custom={2} initial="hidden" animate="visible" variants={fadeUp}
              className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg font-light"
            >
              Real-time reporting, intelligent prioritisation, and data-driven
              maintenance scheduling built for modern universities.
            </motion.p>

            {/* CTAs */}
            <motion.div
              custom={3} initial="hidden" animate="visible" variants={fadeUp}
              className="flex flex-wrap gap-3"
            >
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href={isSignedIn ? "/report" : "/signin"}
                  className="inline-flex items-center gap-2 bg-linear-to-r from-emerald-500 to-emerald-600 text-white font-semibold text-base px-8 py-4 rounded-xl shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-shadow"
                >
                  <AlertCircle className="w-5 h-5" />
                  Report an Issue
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href={isSignedIn ? "/dashboard" : "/signin"}
                  className="inline-flex items-center gap-2 bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 font-semibold text-base px-8 py-4 rounded-xl border-2 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-all"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  View Live Dashboard
                </Link>
              </motion.div>
            </motion.div>

            {/* Social proof */}
            <motion.div
              custom={4} initial="hidden" animate="visible" variants={fadeUp}
              className="flex items-center gap-4 pt-2"
            >
              <div className="flex -space-x-2">
                {["#059669","#10b981","#34d399","#6ee7b7"].map((c, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold" style={{ background: c }}>
                    {["A","B","C","D"][i]}
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">12+ campuses</span> already monitoring
              </p>
            </motion.div>
          </div>

          {/* RIGHT: dashboard preview card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
            className="relative flex justify-center lg:justify-end"
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-full max-w-md"
            >
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-emerald-100 dark:shadow-emerald-950/50 border border-emerald-100 dark:border-emerald-900 overflow-hidden">
                {/* Card header */}
                <div className="bg-linear-to-r from-emerald-600 to-emerald-500 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <Wifi className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">Live Dashboard</p>
                        <p className="text-emerald-200 text-xs">University Main Campus</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
                      <span className="w-1.5 h-1.5 bg-lime-300 rounded-full animate-pulse" />
                      <span className="text-white text-xs font-medium">Live</span>
                    </div>
                  </div>
                  <div className="flex items-end gap-3 mt-4">
                    <div>
                      <p className="text-emerald-200 text-xs mb-1">Cleanliness Score</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-black text-white">87</span>
                        <span className="text-xl text-emerald-200 font-semibold">/100</span>
                      </div>
                    </div>
                    <div className="flex items-end gap-1 pb-1 ml-auto">
                      {[45,65,55,80,70,87].map((h, i) => (
                        <div key={i} className="w-5 bg-white/30 rounded-t-sm relative" style={{ height: `${h * 0.5}px` }}>
                          {i === 5 && <div className="absolute inset-0 bg-lime-300 rounded-t-sm" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Issue list */}
                <div className="p-4 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Active Reports</p>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">3 open</span>
                  </div>
                  {statusItems.map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                      className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-xl px-3.5 py-3 border border-slate-100 dark:border-slate-700"
                    >
                      <div className="flex items-center gap-2.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{item.label}</span>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        item.color === "emerald" ? "bg-emerald-100 text-emerald-700"
                        : item.color === "amber"   ? "bg-amber-100 text-amber-700"
                        :                            "bg-sky-100 text-sky-700"
                      }`}>
                        {item.status}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Footer stats */}
                <div className="grid grid-cols-3 border-t border-slate-100 dark:border-slate-800">
                  {[
                    { icon: CheckCircle2, label: "Resolved Today", val: "14" },
                    { icon: Clock,        label: "Avg. Response",  val: "18m" },
                    { icon: AlertCircle,  label: "Pending",        val: "3"   },
                  ].map(({ icon: Icon, label, val }) => (
                    <div key={label} className="flex flex-col items-center py-4 gap-1 border-r border-slate-100 dark:border-slate-800 last:border-0">
                      <Icon className="w-4 h-4 text-emerald-500" />
                      <span className="text-base font-bold text-slate-800 dark:text-slate-200">{val}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 text-center leading-tight">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating badge */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -top-4 -right-4 bg-white dark:bg-slate-900 shadow-xl shadow-emerald-100 dark:shadow-emerald-950/50 border border-emerald-100 dark:border-emerald-800 rounded-2xl px-4 py-2.5 flex items-center gap-2"
              >
                <span className="text-lg">🌿</span>
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Eco Certified</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Smart Campus 2024</p>
                </div>
              </motion.div>

              {/* Floating notification */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -bottom-5 -left-5 bg-white dark:bg-slate-900 shadow-xl shadow-emerald-100 dark:shadow-emerald-950/50 border border-emerald-100 dark:border-emerald-800 rounded-2xl px-4 py-2.5 flex items-center gap-2.5"
              >
                <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Issue Resolved!</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Block C · 2 min ago</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}