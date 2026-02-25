import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  return (
    <div className="min-h-screen bg-[#f5f1ea]">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 left-10 h-56 w-56 rounded-full bg-[#f0c27b]/35 blur-3xl" />
          <div className="absolute right-10 top-20 h-64 w-64 rounded-full bg-[#7bdff2]/25 blur-3xl" />
          <div className="absolute bottom-10 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#f4978e]/25 blur-3xl" />
        </div>

        <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-start justify-center gap-10 px-6 py-20">
          <div className="flex flex-col gap-6">
            <span className="w-fit rounded-full border border-black/10 bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.3em] text-black/60">
              Campus Operations
            </span>
            <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-black md:text-5xl">
              Keep your campus clean with real-time, verified updates.
            </h1>
            <p className="max-w-2xl text-base text-black/70">
              Track issues, assign teams, and close the loop with photo evidence.
              Sign in to see your account details.
            </p>
          </div>

          <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-3xl border border-black/10 bg-white/85 p-8 shadow-[0_20px_60px_rgba(10,10,10,0.12)] backdrop-blur">
              <h2 className="text-2xl font-semibold text-black">
                {user ? "Welcome back" : "Account details"}
              </h2>
              <p className="mt-2 text-sm text-black/60">
                {user
                  ? "Here is the profile data from your session."
                  : "Sign in to see your profile details here."}
              </p>

              <div className="mt-6 grid gap-4 text-sm text-black">
                <div className="rounded-2xl border border-black/10 bg-white px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-black/40">
                    Name
                  </p>
                  <p className="mt-1 text-base font-medium">
                    {user?.name ?? "Not signed in"}
                  </p>
                </div>
                <div className="rounded-2xl border border-black/10 bg-white px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-black/40">
                    Email
                  </p>
                  <p className="mt-1 text-base font-medium">
                    {user?.email ?? "Not signed in"}
                  </p>
                </div>
                <div className="rounded-2xl border border-black/10 bg-white px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-black/40">
                    User ID
                  </p>
                  <p className="mt-1 text-base font-medium">
                    {user?.id ?? "Not signed in"}
                  </p>
                </div>
                <div className="rounded-2xl border border-black/10 bg-white px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-black/40">
                    Role
                  </p>
                  <p className="mt-1 text-base font-medium">
                    {user?.role ?? "Not assigned"}
                  </p>
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <div className="rounded-3xl border border-black/10 bg-[#111827] p-8 text-white shadow-[0_20px_60px_rgba(10,10,10,0.12)]">
                <h3 className="text-xl font-semibold">Get started</h3>
                <p className="mt-2 text-sm text-white/70">
                  Access the dashboard, report issues, and collaborate with your
                  team.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/signin"
                    className="flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-black transition hover:bg-white/90"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="flex h-12 items-center justify-center rounded-full border border-white/40 px-6 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Sign up
                  </Link>
                </div>
              </div>
              <div className="rounded-3xl border border-black/10 bg-white/80 p-8 text-sm text-black/70">
                <p>
                  Signed-in users see live issue updates, assignments, and audit
                  trails.
                </p>
                <p className="mt-4">
                  Need access? Create an account or sign in with your existing
                  credentials.
                </p>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
