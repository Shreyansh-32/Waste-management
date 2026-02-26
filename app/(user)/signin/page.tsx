"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { signInSchema } from "@/lib/validations/auth";
import type { z } from "zod";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

type SignInValues = z.infer<typeof signInSchema>;

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
      setServerError("Invalid email or password.");
      toast.error("Invalid email or password.");
      return;
    }

    toast.success("Signed in successfully.");
    // /dashboard will read the session role and redirect to the right dashboard
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
      <div className="relative min-h-screen overflow-hidden bg-linear-to-b from-background via-background to-muted">
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            className="absolute -top-20 left-10 h-56 w-56 rounded-full bg-primary/20 blur-3xl"
            animate={{ y: [0, 50, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute right-10 top-24 h-64 w-64 rounded-full bg-secondary/20 blur-3xl"
            animate={{ y: [0, -50, 0] }}
            transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          />
        </div>

        <div className="relative mx-auto flex min-h-[calc(100vh-88px)] max-w-6xl items-center px-6 py-16">
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
              <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                Sign in to manage your campus
                <span className="block bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                  operations.
                </span>
              </h1>
              <p className="max-w-md text-base text-muted-foreground">
                Get live updates on hygiene issues, manage assignments, and close
                tickets with photo proof.
              </p>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Real-time status + accountability
              </div>
            </motion.section>

            <motion.section
              className="rounded-3xl border border-border/40 bg-card/80 p-8 shadow-[0_20px_60px_rgba(10,10,10,0.12)] backdrop-blur supports-backdrop-filter:bg-background/60"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Welcome back</h2>
                <p className="text-sm text-muted-foreground">
                  Use your campus credentials to continue.
                </p>
              </div>

              <form
                className="space-y-5"
                onSubmit={handleSubmit(onSubmit, onError)}
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    {...register("email")}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="you@campus.edu"
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
                    <p className="text-xs text-destructive">
                      {errors.password.message}
                    </p>
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
                  className="w-full bg-primary text-primary-foreground transition disabled:cursor-not-allowed disabled:opacity-70 hover:bg-primary/90"
                >
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                New here?{" "}
                <Link className="font-medium text-primary hover:underline" href="/signup">
                  Create an account
                </Link>
              </p>
            </motion.section>
          </div>
        </div>
      </div>
    </>
  );
}
