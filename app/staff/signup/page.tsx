"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import toast from "react-hot-toast";
import { signUpSchema } from "@/lib/validations/auth";
import type { z } from "zod";
import { motion } from "framer-motion";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Navbar from "@/components/Navbar";

type SignUpValues = z.infer<typeof signUpSchema>;

export default function StaffSignUpPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: SignUpValues) => {
    setServerError(null);
    try {
      await axios.post("/api/auth/staff/signup", {
        name: values.name,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message ?? "Unable to create account.";
        setServerError(message);
        toast.error(message);
        return;
      }
      setServerError("Unable to create account.");
      toast.error("Unable to create account.");
      return;
    }

    toast.success("Staff account created successfully.");
    router.push("/dashboard");
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
            className="absolute -top-24 right-8 h-64 w-64 rounded-full bg-lime-200/40 dark:bg-lime-500/15 blur-3xl"
            animate={{ y: [0, 50, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute left-10 top-32 h-56 w-56 rounded-full bg-emerald-300/30 dark:bg-emerald-500/20 blur-3xl"
            animate={{ y: [0, -50, 0] }}
            transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          />
        </div>

        <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-20">
          <div className="grid w-full gap-12 md:grid-cols-[0.95fr_1.05fr]">
            <motion.section
              className="rounded-3xl border border-emerald-100/60 dark:border-emerald-900/40 bg-white/85 dark:bg-slate-900/80 p-8 shadow-[0_20px_60px_rgba(10,10,10,0.12)] backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-slate-900/70"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Create staff account</h2>
                <p className="text-sm text-muted-foreground">
                  Join the operations team and resolve tasks faster.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit(onSubmit, onError)}>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full name</label>
                  <input
                    type="text"
                    {...register("name")}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="Meera Kapoor"
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name.message}</p>
                  )}
                </div>

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
                    placeholder="Create a password"
                  />
                  {errors.password && (
                    <p className="text-xs text-destructive">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirm password</label>
                  <input
                    type="password"
                    {...register("confirmPassword")}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="Re-enter your password"
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
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
                  {isSubmitting ? "Creating account..." : "Create account"}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Already have a staff account?{" "}
                <Link className="font-medium text-primary hover:underline" href="/staff/signin">
                  Sign in
                </Link>
              </p>
            </motion.section>

            <motion.section
              className="flex flex-col justify-center gap-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
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
                Move faster with
                <span className="block bg-linear-to-r from-emerald-500 via-lime-500 to-emerald-400 bg-clip-text text-transparent">
                  focused tasks.
                </span>
              </h1>
              <p className="max-w-md text-base text-muted-foreground">
                Stay on top of assignments, update progress, and keep the campus
                clean.
              </p>
              <div className="grid gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Clear tasks + deadlines
                </div>
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Status updates on the go
                </div>
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Proof uploads built in
                </div>
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </>
  );
}
