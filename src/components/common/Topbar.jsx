import Icon from "@/components/common/Icon";
import UserMenu from "@/components/common/UserMenu";

export default function Topbar({ onMenu }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button
        onClick={onMenu}
        aria-label="Open menu"
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
      >
        <Icon name="menu" />
      </button>

      <div className="relative max-w-xl flex-1">
        <Icon
          name="search"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="search"
          placeholder="Search candidates, skills, jobs..."
          className="h-10 w-full rounded-lg border border-slate-200 bg-surface-container-low pl-10 pr-3 text-sm placeholder:text-slate-400 focus:border-primary-container focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-container/15"
        />
      </div>

      <div className="ml-auto flex items-center gap-1">
        <button
          aria-label="Notifications"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
        >
          <Icon name="notifications" />
        </button>
        <UserMenu />
      </div>
    </header>
  );
}
