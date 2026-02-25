"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import axios from "axios";
import toast from "react-hot-toast";
import { signUpSchema } from "@/lib/validations/auth";
import type { z } from "zod";

type SignUpValues = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
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
      await axios.post("/api/auth/signup", {
        name: values.name,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message ?? "Unable to create account.";
        setServerError(message);
        toast.error(message);
        return;
      }
      setServerError("Unable to create account.");
      toast.error("Unable to create account.");
      return;
    }

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
  };

  const onError = (formErrors: typeof errors) => {
    const firstError = Object.values(formErrors)[0];
    const message = firstError?.message ?? "Please check your inputs.";
    toast.error(message);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f9f3]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 right-8 h-64 w-64 rounded-full bg-[#96ceb4]/40 blur-3xl" />
        <div className="absolute left-10 top-32 h-56 w-56 rounded-full bg-[#ffcc5c]/35 blur-3xl" />
        <div className="absolute bottom-6 right-1/3 h-72 w-72 rounded-full bg-[#88d8b0]/30 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-6 py-16">
        <div className="grid w-full gap-12 md:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-3xl border border-black/10 bg-white/85 p-8 shadow-[0_20px_60px_rgba(10,10,10,0.12)] backdrop-blur">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-black">Create account</h2>
              <p className="text-sm text-black/60">
                Start reporting and tracking cleanliness issues in minutes.
              </p>
            </div>

            <form
              className="space-y-5"
              onSubmit={handleSubmit(onSubmit, onError)}
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-black">Full name</label>
                <input
                  type="text"
                  {...register("name")}
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black shadow-sm outline-none transition focus:border-black/30"
                  placeholder="Priya Sharma"
                />
                {errors.name && (
                  <p className="text-xs text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-black">Email</label>
                <input
                  type="email"
                  {...register("email")}
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black shadow-sm outline-none transition focus:border-black/30"
                  placeholder="you@campus.edu"
                />
                {errors.email && (
                  <p className="text-xs text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-black">Password</label>
                <input
                  type="password"
                  {...register("password")}
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black shadow-sm outline-none transition focus:border-black/30"
                  placeholder="Create a password"
                />
                {errors.password && (
                  <p className="text-xs text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-black">
                  Confirm password
                </label>
                <input
                  type="password"
                  {...register("confirmPassword")}
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black shadow-sm outline-none transition focus:border-black/30"
                  placeholder="Re-enter your password"
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-600">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {serverError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
                  {serverError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-[#2f8f5b] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#236c44] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="mt-6 text-sm text-black/60">
              Already have an account?{" "}
              <Link className="font-medium text-[#2f8f5b]" href="/signin">
                Sign in
              </Link>
            </p>
          </section>

          <section className="flex flex-col justify-center gap-6">
            <span className="w-fit rounded-full border border-black/10 bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.3em] text-black/60">
              Join the crew
            </span>
            <h1 className="text-4xl font-semibold leading-tight text-black md:text-5xl">
              Cleanliness with a
              <span className="block text-[#2f8f5b]">real-time edge.</span>
            </h1>
            <p className="max-w-md text-base text-black/70">
              Share live issues, get faster response times, and see every task
              verified with proof.
            </p>
            <div className="grid gap-3 text-sm text-black/60">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#2f8f5b]" />
                Auto-priority with urgency scoring
              </div>
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#2f8f5b]" />
                QR-tagged locations + heatmap insights
              </div>
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#2f8f5b]" />
                Verified completion with after photos
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
