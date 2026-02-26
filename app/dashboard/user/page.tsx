import { redirect } from "next/navigation";
export default function UserDashboardRoot() {
  redirect("/dashboard/user/requests");
}
