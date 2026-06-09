import { Outlet } from "react-router";
import { Navbar } from "~/components/layout/navbar";
import { useAuth } from "~/modules/authentication";
import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");
  return null;
}

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Navbar />
      <Outlet />
    </div>
  );
}
