"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Camera,
  QrCode,
  Brain,
  ClipboardList,
  Activity,
  BarChart2,
} from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "Real-Time Reporting",
    description:
      "Staff and students can instantly report cleanliness issues with photos directly from their phones.",
    gradient: "from-emerald-400 to-emerald-600",
  },
  {
    icon: QrCode,
    title: "QR Location Tagging",
    description:
      "Unique QR codes placed around campus enable precise geolocation of every reported issue automatically.",
    gradient: "from-lime-400 to-emerald-500",
  },
  {
    icon: Brain,
    title: "Intelligent Priority Detection",
    description:
      "AI-powered triage scores each issue by urgency, type, and footfall to surface critical problems first.",
    gradient: "from-teal-400 to-emerald-600",
  },
  {
    icon: ClipboardList,
    title: "Admin Task Assignment",
    description:
      "Supervisors get a unified dashboard to assign, delegate, and track tasks across cleaning teams in real time.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Activity,
    title: "Live Status Tracking",
    description:
      "End-to-end visibility from report creation to resolution with time-stamped status updates and photo evidence.",
    gradient: "from-green-400 to-emerald-600",
  },
  {
    icon: BarChart2,
    title: "Heatmap Analytics",
    description:
      "Visual heatmaps identify recurring problem hotspots and guide proactive cleaning schedule optimization.",
    gradient: "from-lime-500 to-green-600",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export default function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="features" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-emerald-50/30 to-white pointer-events-none" />

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
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-5 leading-tight">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-lime-500 bg-clip-text text-transparent">
              run a clean campus
            </span>
          </h2>
          <p className="text-slate-500 text-lg leading-relaxed">
            A complete operational toolkit purpose-built for campus facilities
            managers and sustainability teams.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                whileHover={{ y: -6, boxShadow: "0 20px 60px -10px rgba(16,185,129,0.15)" }}
                className="group bg-white rounded-2xl p-7 border border-slate-100 shadow-sm hover:border-emerald-200 transition-all duration-300 cursor-default"
              >
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-md group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-lg font-bold text-slate-800 mb-2.5">
                  {feature.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {feature.description}
                </p>

                {/* Bottom accent */}
                <div
                  className={`mt-5 h-0.5 w-0 group-hover:w-full bg-gradient-to-r ${feature.gradient} rounded-full transition-all duration-500`}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
