import { redirect } from "next/navigation";
export default function StaffDashboardRoot() {
  redirect("/dashboard/staff/tasks");
}
