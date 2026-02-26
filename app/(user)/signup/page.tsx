"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import axios from "axios";
import toast from "react-hot-toast";
import { motion } from "motion/react";
import { Leaf, Mail, Lock, User, ArrowRight, QrCode, Brain, ClipboardList } from "lucide-react";
import { signUpSchema } from "@/lib/validations/auth";
import type { z } from "zod";

type SignUpValues = z.infer<typeof signUpSchema>;

const perks = [
  { icon: QrCode,        text: "QR-tagged locations for precise issue pinpointing" },
  { icon: Brain,         text: "AI-powered priority scoring for faster response" },
  { icon: ClipboardList, text: "Full audit trail from report to verified resolution" },
];

export default function SignUpPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: SignUpValues) => {
    setServerError(null);

    try {
      await axios.post("/api/auth/signup", {
        name: values.name,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Unable to create account.")
        : "Unable to create account.";
      setServerError(message);
      toast.error(message);
      return;
    }

    // Auto sign-in after successful registration
    const signInResult = await signIn("credentials", {
      redirect: false,
      email: values.email,
      password: values.password,
    });

    if (!signInResult || signInResult.error) {
      toast.success("Account created. Please sign in.");
      router.push("/signin");
      return;
    }

    toast.success("Account created successfully.");
    router.push("/");
    router.refresh();
  };

  const onError = (formErrors: typeof errors) => {
    const firstError = Object.values(formErrors)[0];
    toast.error(firstError?.message ?? "Please check your inputs.");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f8fffe]">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 right-8 h-[500px] w-[500px] rounded-full bg-emerald-200/30 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-lime-200/25 blur-[100px]" />
        <div className="absolute inset-0 bg-grid opacity-100" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-6 py-16">
        <div className="grid w-full items-center gap-12 lg:grid-cols-2">

          {/* ── Left: form card ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="rounded-3xl border border-black/8 bg-white/90 p-8 shadow-[0_24px_64px_rgba(10,10,10,0.10)] backdrop-blur-md">
              <div className="mb-7">
                <h2 className="text-2xl font-bold text-slate-900">Create account</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Start reporting and tracking cleanliness issues in minutes.
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit(onSubmit, onError)}>
                {/* Full name */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Full name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      {...register("name")}
                      className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                      placeholder="Priya Sharma"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-xs text-red-500">{errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      {...register("email")}
                      className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                      placeholder="you@campus.edu"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-500">{errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      {...register("password")}
                      className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                      placeholder="Create a strong password"
                    />
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-500">{errors.password.message}</p>
                  )}
                </div>

                {/* Confirm password */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Confirm password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      {...register("confirmPassword")}
                      className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                      placeholder="Re-enter your password"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Server error */}
                {serverError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
                    {serverError}
                  </div>
                )}

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:shadow-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Creating account…
                    </>
                  ) : (
                    <>
                      Create account
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  href="/signin"
                  className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </motion.div>

          {/* ── Right: brand panel ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col gap-8 lg:pl-8"
          >
            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-2.5 w-fit">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-slate-800 text-lg">
                Smart<span className="text-emerald-600">Campus</span>
              </span>
            </Link>

            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-emerald-600 mb-4">
                Join the crew
              </span>
              <h1 className="text-4xl font-extrabold leading-tight text-slate-900 md:text-5xl mb-4">
                Cleanliness with a{" "}
                <span className="bg-gradient-to-r from-emerald-500 to-lime-500 bg-clip-text text-transparent">
                  real-time edge.
                </span>
              </h1>
              <p className="text-slate-500 text-base leading-relaxed max-w-sm">
                Share live issues, get faster response times, and see every task
                verified with photo proof.
              </p>
            </div>

            {/* Perks */}
            <div className="flex flex-col gap-4">
              {perks.map(({ icon: Icon, text }, i) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-sm text-slate-600">{text}</span>
                </motion.div>
              ))}
            </div>

            {/* Mini stat strip */}
            <div className="grid grid-cols-3 gap-3 mt-2">
              {[
                { val: "40%",  label: "Faster resolution" },
                { val: "3x",   label: "Staff efficiency"  },
                { val: "24/7", label: "Live monitoring"    },
              ].map(({ val, label }) => (
                <div key={label} className="rounded-2xl border border-emerald-100 bg-white/70 p-3 text-center">
                  <p className="text-xl font-black text-emerald-600">{val}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}