import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import UserLayoutClient from "@/components/dashboard/UserLayoutClient";

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/signin");
  }

  const role = (session.user as { role?: string } | undefined)?.role;
  if (role === "ADMIN") {
    redirect("/admin/dashboard");
  }
  if (role === "STAFF") {
    redirect("/staff/dashboard");
  }

  return <UserLayoutClient>{children}</UserLayoutClient>;
}
