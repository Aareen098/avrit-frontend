import { Link, NavLink, Outlet } from "react-router-dom";
import Logo from "@/components/common/Logo";

const link = ({ isActive }) =>
  `text-sm font-medium ${isActive ? "text-primary" : "text-slate-500 hover:text-on-surface"}`;

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-surface text-on-surface">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link to="/careers"><Logo /></Link>
          <nav className="flex items-center gap-5">
            <NavLink to="/careers" className={link}>Careers</NavLink>
            <NavLink to="/status" className={link}>Check status</NavLink>
            <Link to="/login" className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium hover:bg-slate-50">Sign in</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Avrit
      </footer>
    </div>
  );
}