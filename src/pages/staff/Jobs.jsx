import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getJobs } from "@/api/jobs.api";
import { useAuthStore } from "@/store/authStore";
import { ROLES } from "@/utils/constants";
import Button from "@/components/ui/Button";
import Icon from "@/components/common/Icon";
import { cn } from "@/utils/cn";

const STATUS = {
  OPEN: { label: "Open", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  DRAFT: { label: "Draft", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  CLOSED: { label: "Closed", cls: "bg-slate-100 text-slate-600 border-slate-200" },
};
const TABS = ["ALL", "OPEN", "DRAFT", "CLOSED"];

export default function Jobs() {
  const role = useAuthStore((s) => s.user?.role);
  const canCreate = role === ROLES.ADMIN || role === ROLES.RECRUITER;
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("ALL");
  const { data: jobs = [], isLoading, isError, refetch } = useQuery({ queryKey: ["jobs"], queryFn: getJobs });

  const q = search.trim().toLowerCase();
  const shown = jobs.filter(
    (j) =>
      (tab === "ALL" || j.status === tab) &&
      (!q || `${j.title} ${j.department} ${j.location}`.toLowerCase().includes(q))
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Jobs</h1>
          <p className="mt-1 text-slate-500">Manage your open roles and drafts.</p>
        </div>
        {canCreate && (
          <Link to="/jobs/new">
            <Button><Icon name="add" className="text-xl" /> New Job</Button>
          </Link>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs..."
            aria-label="Search jobs"
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/15"
          />
        </div>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium",
                tab === t ? "bg-white text-on-surface shadow-card" : "text-slate-500 hover:text-on-surface"
              )}
            >
              {t === "ALL" ? "All" : STATUS[t].label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
        {isLoading ? (
          <p className="p-10 text-center text-slate-500">Loading jobs...</p>
        ) : isError ? (
          <div className="p-10 text-center">
            <p className="text-red-600">Could not load jobs.</p>
            <Button variant="secondary" size="sm" className="mt-3" onClick={() => refetch()}>Try again</Button>
          </div>
        ) : shown.length === 0 ? (
          <p className="p-10 text-center text-slate-500">No jobs match your search.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {shown.map((j) => (
              <li key={j.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 hover:bg-slate-50 sm:px-6">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{j.title}</p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {j.department} · {j.location} · {j.type}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-slate-500">
                    <Icon name="group" className="text-lg" /> {j.applicants}
                  </span>
                  <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-semibold", STATUS[j.status]?.cls)}>
                    {STATUS[j.status]?.label ?? j.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}