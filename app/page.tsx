import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import HowItWorks from "@/components/sections/HowItWorks";
import AnalyticsPreview from "@/components/sections/AnalyticsPreview";
import ImpactStats from "@/components/sections/ImpactStats";
import CallToAction from "@/components/sections/CallToAction";
import Footer from "@/components/sections/Footer";
import type { Session } from "next-auth";

export default async function Home() {
  // Fetch session server-side — no extra client round-trip needed
  const session: Session | null = await getServerSession(authOptions);
  const user = session?.user;

  return (
    <main className="min-h-screen bg-[#f8fffe]">
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