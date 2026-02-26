"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { signInSchema } from "@/lib/validations/auth";
import type { z } from "zod";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

type SignInValues = z.infer<typeof signInSchema>;

export default function StaffSignInPage() {
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
    try {
      const res = await fetch("/api/auth/staff/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.message || "Invalid email or password.");
      }

      toast.success("Signed in successfully.");
      router.push("/");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid email or password.";
      setServerError(message);
      toast.error(message);
    }
  };

  const onError = (formErrors: typeof errors) => {
    const firstError = Object.values(formErrors)[0];
    const message = firstError?.message ?? "Please check your inputs.";
    toast.error(message);
  };

  return (
    <>
      <Navbar />
      <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
        <div className="absolute inset-0 bg-grid pointer-events-none" />
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            className="absolute -top-20 left-10 h-56 w-56 rounded-full bg-emerald-300/30 dark:bg-emerald-500/20 blur-3xl"
            animate={{ y: [0, 50, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute right-10 top-24 h-64 w-64 rounded-full bg-lime-200/40 dark:bg-lime-500/15 blur-3xl"
            animate={{ y: [0, -50, 0] }}
            transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          />
        </div>

        <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-20">
          <div className="grid w-full gap-12 md:grid-cols-[1.1fr_0.9fr]">
            <motion.section
              className="flex flex-col justify-center gap-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/Logo.png"
                  alt="CampusClean"
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain"
                />
                <span className="text-xl font-bold">CampusClean</span>
              </div>
              <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl text-slate-900 dark:text-slate-100">
                Staff access to
                <span className="block bg-linear-to-r from-emerald-500 to-lime-500 bg-clip-text text-transparent">
                  complete tasks.
                </span>
              </h1>
              <p className="max-w-md text-base text-muted-foreground">
                Track assignments, update statuses, and upload completion proof.
              </p>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Faster turnaround + accountability
              </div>
            </motion.section>

            <motion.section
              className="rounded-3xl border border-emerald-100/60 dark:border-emerald-900/40 bg-white/85 dark:bg-slate-900/80 p-8 shadow-[0_20px_60px_rgba(10,10,10,0.12)] backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-slate-900/70"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Staff sign in</h2>
                <p className="text-sm text-muted-foreground">
                  Use your staff credentials to continue.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit(onSubmit, onError)}>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    {...register("email")}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="staff@campus.edu"
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <input
                    type="password"
                    {...register("password")}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="Enter your password"
                  />
                  {errors.password && (
                    <p className="text-xs text-destructive">{errors.password.message}</p>
                  )}
                </div>

                {serverError && (
                  <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-xs text-destructive">
                    {serverError}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="lg"
                  className="w-full bg-linear-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-200/80 transition disabled:cursor-not-allowed disabled:opacity-70 hover:shadow-emerald-300/80"
                >
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Need a staff account?{" "}
                <Link className="font-medium text-primary hover:underline" href="/staff/signup">
                  Create one
                </Link>
              </p>
            </motion.section>
          </div>
        </div>
      </div>
    </>
  );
}
