import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { homeFor } from "@/utils/constants";

// For login/register pages: logged-in users are sent onward instead.
// If they were bounced here from a protected page, send them back there.
export default function GuestRoute() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (token && user && homeFor(user.role) !== "/login") {
    const target = location.state?.from?.pathname || homeFor(user.role);
    return <Navigate to={target} replace />;
  }
  return <Outlet />;
}
