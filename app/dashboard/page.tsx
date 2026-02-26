import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/signin");
  }

  const role = (session.user as { role?: string })?.role;

  if (role === "ADMIN") redirect("/admin/dashboard");
  if (role === "STAFF") redirect("/staff/dashboard");

  // STUDENT, FACULTY, STAFF, or anything else
  redirect("/dashboard/user");
}
