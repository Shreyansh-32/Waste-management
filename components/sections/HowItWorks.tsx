"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ScanQrCode, UserCheck, CheckCircle2 } from "lucide-react";

const steps = [
  {
    icon: ScanQrCode,
    step: "01",
    title: "Report",
    description:
      "Anyone on campus scans a QR code or opens the app to instantly report an issue with photo and GPS location.",
    color: "emerald",
  },
  {
    icon: UserCheck,
    step: "02",
    title: "Assign",
    description:
      "Our system auto-scores priority and notifies the right cleaning team. Supervisors can reassign with one tap.",
    color: "teal",
  },
  {
    icon: CheckCircle2,
    step: "03",
    title: "Resolve",
    description:
      "Staff upload completion proof. The reporter is notified. The resolution is logged for performance analytics.",
    color: "lime",
  },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="how-it-works" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-slate-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid bg-[length:60px_60px] opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-xl mx-auto mb-16"
        >
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400 mb-4 block">
            Simple Process
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5 leading-tight">
            Three steps to a{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-lime-400 bg-clip-text text-transparent">
              spotless campus
            </span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Designed for speed and simplicity — no training required.
          </p>
        </motion.div>

        {/* Steps */}
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
          {/* Connector line (desktop only) */}
          <div className="hidden md:block absolute top-[52px] left-[calc(16.67%+20px)] right-[calc(16.67%+20px)] h-px bg-gradient-to-r from-emerald-600 via-teal-500 to-lime-500 opacity-40 z-0" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="relative z-10 flex flex-col items-center text-center group"
              >
                {/* Step number badge */}
                <div className="relative mb-6">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-2xl shadow-emerald-900/50 border-4 border-emerald-900 group-hover:shadow-emerald-500/30 transition-shadow duration-300"
                  >
                    <Icon className="w-10 h-10 text-white" />
                  </motion.div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 bg-slate-950 border-2 border-emerald-500 rounded-full flex items-center justify-center text-xs font-black text-emerald-400">
                    {step.step}
                  </span>
                </div>

                {/* Content */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 w-full hover:bg-white/8 hover:border-emerald-500/30 transition-all duration-300">
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
