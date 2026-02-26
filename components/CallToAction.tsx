"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CallToAction() {
  return (
    <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <div className="relative bg-linear-to-br from-emerald-600 via-emerald-500 to-teal-500 rounded-3xl overflow-hidden p-12 lg:p-20 text-center">
          {/* Animated blobs */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-20 -left-20 w-64 h-64 bg-lime-400/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute -bottom-20 -right-20 w-80 h-80 bg-teal-400/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl"
          />

          {/* Subtle grid */}
          <div className="absolute inset-0 bg-grid bg-[length:40px_40px] opacity-20" />

          {/* Content */}
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-white/20 border border-white/30 text-white text-xs font-bold px-4 py-2 rounded-full mb-6"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Ready to Transform Your Campus?
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight"
            >
              Build a Cleaner Campus{" "}
              <span className="text-lime-300">Today</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-emerald-100 text-lg max-w-xl mx-auto mb-10 leading-relaxed"
            >
              Join forward-thinking institutions using real-time data to create
              healthier, more sustainable campus environments.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2.5 bg-white text-emerald-700 font-bold text-base px-8 py-4 rounded-xl shadow-xl shadow-emerald-900/20 hover:shadow-emerald-900/30 transition-shadow"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2.5 bg-white/10 border border-white/30 text-white font-semibold text-base px-8 py-4 rounded-xl hover:bg-white/20 transition-colors"
              >
                Schedule a Demo
              </motion.button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-6 text-emerald-100/80 text-sm"
            >
              {["✓ Free 30-day trial", "✓ No credit card required", "✓ Setup in under 1 hour"].map((item) => (
                <span key={item} className="font-medium">{item}</span>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
