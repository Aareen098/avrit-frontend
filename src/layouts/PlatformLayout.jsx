import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import Logo from "@/components/common/Logo";
import Icon from "@/components/common/Icon";
import UserMenu from "@/components/common/UserMenu";
import NotificationBell from "@/features/notifications/NotificationBell";
import { PLATFORM_NAV } from "@/utils/navigation";
import { cn } from "@/utils/cn";

// Sidebar + top bar for the platform owner. Separate from the company dashboard on purpose.
export default function PlatformLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface">
      {open && <div className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden" onClick={() => setOpen(false)} aria-hidden="true" />}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Logo tag="OWNER" />
          <button onClick={() => setOpen(false)} aria-label="Close menu" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden">
            <Icon name="close" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {PLATFORM_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive ? "bg-primary-container text-white shadow-card" : "text-slate-600 hover:bg-slate-100 hover:text-on-surface"
                )
              }
            >
              <Icon name={item.icon} />
              <span className="flex-1">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur sm:px-6 lg:px-8">
          <button onClick={() => setOpen(true)} aria-label="Open menu" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden">
            <Icon name="menu" />
          </button>
          <div className="ml-auto flex items-center gap-1">
            <NotificationBell />
            <UserMenu />
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}