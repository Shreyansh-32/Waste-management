"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { signInSchema } from "@/lib/validations/auth";
import type { z } from "zod";

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
			return;
		}

		router.push("/");
	};

	return (
		<div className="relative min-h-screen overflow-hidden bg-[#f7f4ef]">
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute -top-20 left-10 h-56 w-56 rounded-full bg-[#f4c95d]/40 blur-3xl" />
				<div className="absolute right-10 top-24 h-64 w-64 rounded-full bg-[#59c3c3]/30 blur-3xl" />
				<div className="absolute bottom-10 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#f28b82]/25 blur-3xl" />
			</div>

			<div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-6 py-16">
				<div className="grid w-full gap-12 md:grid-cols-[1.1fr_0.9fr]">
					<section className="flex flex-col justify-center gap-6">
						<span className="w-fit rounded-full border border-black/10 bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.3em] text-black/60">
							Smart Campus
						</span>
						<h1 className="text-4xl font-semibold leading-tight text-black md:text-5xl">
							Sign in to keep the campus
							<span className="block text-[#1b5f5a]">spotless and smart.</span>
						</h1>
						<p className="max-w-md text-base text-black/70">
							Get live updates on hygiene issues, manage assignments, and close
							tickets with photo proof.
						</p>
						<div className="flex items-center gap-3 text-sm text-black/60">
							<span className="h-2 w-2 rounded-full bg-[#1b5f5a]" />
							Real-time status + accountability
						</div>
					</section>

					<section className="rounded-3xl border border-black/10 bg-white/80 p-8 shadow-[0_20px_60px_rgba(10,10,10,0.12)] backdrop-blur">
						<div className="mb-6">
							<h2 className="text-2xl font-semibold text-black">Welcome back</h2>
							<p className="text-sm text-black/60">
								Use your campus credentials to continue.
							</p>
						</div>

						<form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
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
									placeholder="Enter your password"
								/>
								{errors.password && (
									<p className="text-xs text-red-600">
										{errors.password.message}
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
								className="w-full rounded-2xl bg-[#1b5f5a] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#134743] disabled:cursor-not-allowed disabled:opacity-70"
							>
								{isSubmitting ? "Signing in..." : "Sign in"}
							</button>
						</form>

						<p className="mt-6 text-sm text-black/60">
							New here?{" "}
							<Link className="font-medium text-[#1b5f5a]" href="/signup">
								Create an account
							</Link>
						</p>
					</section>
				</div>
			</div>
		</div>
	);
}
