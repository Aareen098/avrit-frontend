import { NavLink, useNavigate } from "react-router-dom";
import Logo from "@/components/common/Logo";
import Icon from "@/components/common/Icon";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";
import { ROLES } from "@/utils/constants";
import { STAFF_NAV } from "@/utils/navigation";
import { cn } from "@/utils/cn";

export default function Sidebar({ open, onClose }) {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const items = STAFF_NAV.filter((item) => item.roles.includes(user.role));
  const canPostJob = [ROLES.ADMIN, ROLES.RECRUITER].includes(user.role);

  const postJob = () => {
    onClose();
    navigate("/jobs/new");
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Logo tag="ATS" />
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <Icon name="close" />
          </button>
        </div>

        {user.companyName && (
          <div className="mx-3 mb-1 rounded-lg bg-surface-container-low px-3 py-2">
            <p className="truncate text-sm font-semibold">{user.companyName}</p>
            {user.companySlug && (
              <a
                href={`/c/${user.companySlug}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-primary hover:underline"
              >
                View careers page
              </a>
            )}
          </div>
        )}

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-container text-white shadow-card"
                    : "text-slate-600 hover:bg-slate-100 hover:text-on-surface"
                )
              }
            >
              <Icon name={item.icon} />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {canPostJob && (
          <div className="border-t border-slate-100 p-4">
            <Button fullWidth onClick={postJob}>
              <Icon name="add" /> Post New Job
            </Button>
          </div>
        )}
      </aside>
    </>
  );
}
