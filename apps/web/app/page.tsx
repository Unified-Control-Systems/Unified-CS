
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardPage from "./dashboard-page";

export default async function HomePage() {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get("unified_access_token");
  const refreshToken = cookieStore.get("unified_refresh_token");

  if (!accessToken && !refreshToken) {
    redirect("/login");
  }

  return <DashboardPage />;
}
