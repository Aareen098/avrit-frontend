import { Link, NavLink, Outlet } from "react-router-dom";
import Logo from "@/components/common/Logo";
import UserMenu from "@/components/common/UserMenu";
import VerifyBanner from "@/features/auth/VerifyBanner";
import { CANDIDATE_NAV } from "@/utils/navigation";
import { cn } from "@/utils/cn";

// Simple top navigation for candidates (no sidebar).
export default function CandidateLayout() {
  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-y-2 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-8">
            <Link to="/portal">
              <Logo />
            </Link>
          </div>

          <nav className="order-3 flex w-full gap-1 sm:order-none sm:w-auto">
            {CANDIDATE_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary-fixed/60 text-primary"
                      : "text-slate-600 hover:bg-slate-100 hover:text-on-surface"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <UserMenu />
        </div>
      </header>

      <VerifyBanner />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
