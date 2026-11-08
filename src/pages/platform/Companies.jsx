import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCompanies } from "@/api/platform.api";
import Icon from "@/components/common/Icon";
import { formatBytes, formatCount } from "@/utils/format";
import { cn } from "@/utils/cn";

export function StatusBadge({ suspended }) {
  return (
    <span
      className={cn(
        "rounded-full border px-2.5 py-0.5 text-xs font-medium",
        suspended ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"
      )}
    >
      {suspended ? "Suspended" : "Active"}
    </span>
  );
}

export default function Companies() {
  const [search, setSearch] = useState("");
  const { data: companies = [], isLoading, isError, refetch } = useQuery({ queryKey: ["platform", "companies"], queryFn: getCompanies });

  const q = search.trim().toLowerCase();
  const shown = companies.filter((c) => !q || `${c.name} ${c.slug} ${c.industry ?? ""}`.toLowerCase().includes(q));

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Companies</h1>
      <p className="mt-1 text-slate-500">How much each company uses this month.</p>

      <div className="relative mt-6 w-full sm:w-80">
        <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search companies..."
          aria-label="Search companies"
          className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/15"
        />
      </div>

      {isLoading && <p className="mt-6 text-slate-500">Loading...</p>}
      {isError && (
        <p className="mt-6 text-slate-600">
          Could not load companies. <button onClick={() => refetch()} className="font-medium text-primary-container underline">Try again</button>
        </p>
      )}

      {!isLoading && !isError && (
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-card">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 text-right font-medium">Seats</th>
                <th className="px-4 py-3 text-right font-medium">Open jobs</th>
                <th className="px-4 py-3 text-right font-medium">Applications</th>
                <th className="px-4 py-3 text-right font-medium">AI calls</th>
                <th className="px-4 py-3 text-right font-medium">LLM tokens</th>
                <th className="px-4 py-3 text-right font-medium">Emails</th>
                <th className="px-4 py-3 text-right font-medium">CV storage</th>
                <th className="px-4 py-3 font-medium">Last active</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shown.length === 0 && (
                <tr><td colSpan={11} className="px-4 py-8 text-center text-slate-500">No companies found.</td></tr>
              )}
              {shown.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link to={`/platform/companies/${c.id}`} className="font-medium text-primary-container hover:underline">{c.name}</Link>
                    <p className="text-xs text-slate-500">{c.industry || "No industry"} · joined {c.createdAt}</p>
                  </td>
                  <td className="px-4 py-3">{c.planCode}</td>
                  <td className="px-4 py-3 text-right">{c.seats}</td>
                  <td className="px-4 py-3 text-right">{c.openJobs}</td>
                  <td className="px-4 py-3 text-right">{c.applicationsThisMonth}</td>
                  <td className="px-4 py-3 text-right">{c.aiCallsThisMonth}</td>
                  <td className="px-4 py-3 text-right">{formatCount(c.llmTokensThisMonth)}</td>
                  <td className="px-4 py-3 text-right">{formatCount(c.emailsThisMonth)}</td>
                  <td className="px-4 py-3 text-right">{formatBytes(c.storageBytes)}</td>
                  <td className="px-4 py-3 text-slate-600">{c.lastActive || "None yet"}</td>
                  <td className="px-4 py-3"><StatusBadge suspended={c.suspended} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}