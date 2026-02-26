import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import AdminLayoutClient from "@/components/dashboard/AdminLayoutClient";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/signin");
  }

  const role = (session.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN") {
    redirect("/dashboard");
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
