import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import StaffLayoutClient from "@/components/dashboard/StaffLayoutClient";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/signin");
  }

  const role = (session.user as { role?: string } | undefined)?.role;
  if (role !== "STAFF") {
    redirect("/dashboard");
  }

  return <StaffLayoutClient>{children}</StaffLayoutClient>;
}
