"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { Leaf, Mail, Lock, ArrowRight, CheckCircle2, Activity, BarChart2 } from "lucide-react";
import { signInSchema } from "@/lib/validations/auth";
import type { z } from "zod";
import { motion } from "framer-motion";

type SignInValues = z.infer<typeof signInSchema>;

const features = [
  { icon: CheckCircle2, text: "Real-time issue tracking with photo verification" },
  { icon: Activity,     text: "Live status updates for every campus zone" },
  { icon: BarChart2,    text: "Heatmap analytics and weekly cleanliness scores" },
];

export default function SignInPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: SignInValues) => {
    setServerError(null);

    const result = await signIn("credentials", {
      redirect: false,
      email: values.email,
      password: values.password,
    });

    if (!result || result.error) {
      const msg = "Invalid email or password.";
      setServerError(msg);
      toast.error(msg);
      return;
    }

    toast.success("Signed in successfully.");
    router.push("/");
    router.refresh(); // re-run server layout so getServerSession picks up the new session
  };

  const onError = (formErrors: typeof errors) => {
    const firstError = Object.values(formErrors)[0];
    toast.error(firstError?.message ?? "Please check your inputs.");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f8fffe]">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 right-0 h-[500px] w-[500px] rounded-full bg-emerald-200/30 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-lime-200/25 blur-[100px]" />
        <div className="absolute inset-0 bg-grid opacity-100" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-6 py-16">
        <div className="grid w-full items-center gap-12 lg:grid-cols-2">

          {/* ── Left: brand panel ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col gap-8 lg:pr-8"
          >
            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-2.5 group w-fit">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-slate-800 text-lg">
                Smart<span className="text-emerald-600">Campus</span>
              </span>
            </Link>

            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-emerald-600 mb-4">
                Smart Campus · Operations
              </span>
              <h1 className="text-4xl font-extrabold leading-tight text-slate-900 md:text-5xl mb-4">
                Sign in to keep<br />
                your campus{" "}
                <span className="bg-gradient-to-r from-emerald-500 to-lime-500 bg-clip-text text-transparent">
                  spotless.
                </span>
              </h1>
              <p className="text-slate-500 text-base leading-relaxed max-w-sm">
                Get live updates on hygiene issues, manage assignments, and close
                tickets with photo proof.
              </p>
            </div>

            {/* Feature list */}
            <div className="flex flex-col gap-4">
              {features.map(({ icon: Icon, text }, i) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, x: -20 }}
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
          </motion.div>

          {/* ── Right: form card ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="rounded-3xl border border-black/8 bg-white/90 p-8 shadow-[0_24px_64px_rgba(10,10,10,0.10)] backdrop-blur-md">
              <div className="mb-7">
                <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Use your campus credentials to continue.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit(onSubmit, onError)}>
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
                      placeholder="Enter your password"
                    />
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-500">{errors.password.message}</p>
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
                      Signing in…
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                New here?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
