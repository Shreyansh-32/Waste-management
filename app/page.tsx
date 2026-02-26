import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Session } from "next-auth";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import AnalyticsPreview from "@/components/AnalyticsPreview";
import ImpactStats from "@/components/ImpactStats";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";

export default async function Home() {
  // Fetch session server-side — no extra client round-trip needed
  const session: Session | null = await getServerSession(authOptions);
  const user = session?.user;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar user={user} />
      <Hero user={user} />
      <Features />
      <HowItWorks />
      <AnalyticsPreview />
      <ImpactStats />
      <CallToAction />
      <Footer />
    </main>
  );
}