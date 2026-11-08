import { lazy, Suspense,useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getDashboardSummary } from "@/api/dashboard.api";
import { getCompanyUsage } from "@/api/usage.api";
import StatTile from "@/features/dashboard/StatTile";
import ScoreBadge from "@/components/common/ScoreBadge";
import StageBadge from "@/components/common/StageBadge";
import { useAuthStore } from "@/store/authStore";
import { ROLES, ROLE_LABELS } from "@/utils/constants";
import { getInitials } from "@/utils/format";

// Chart code (ECharts) is a separate download. Usage is only loaded for admins.
const loadInsights = () => import("@/features/dashboard/CandidateInsights");
const loadUsage = () => import("@/features/dashboard/UsagePanel");
const CandidateInsights = lazy(loadInsights);
const UsagePanel = lazy(loadUsage);
const chartsLoading = (
  <div className="mt-6 h-96 animate-pulse rounded-xl bg-slate-100" />
);

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user.role === ROLES.ADMIN;
  const q = useQuery({ queryKey: ["dashboard"], queryFn: getDashboardSummary });
  // Start the usage request and the chart code downloads right away, in parallel with the summary.
  useQuery({ queryKey: ["company-usage"], queryFn: getCompanyUsage, enabled: isAdmin });
  useEffect(() => {
    loadInsights();
    if (isAdmin) loadUsage();
  }, [isAdmin]);
  const d = q.data;
  const loading = q.isLoading;
  const topMatches = d?.topMatches ?? [];

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Welcome back, {user.name}
      </h1>
      <p className="mt-1 text-slate-500">
        You are signed in as {ROLE_LABELS[user.role] || user.role}. Here is your
        hiring at a glance.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatTile
          label="Open jobs"
          icon="work"
          loading={loading}
          value={d?.openJobs ?? 0}
        />
        <StatTile
          label="Candidates"
          icon="group"
          loading={loading}
          value={d?.total ?? 0}
          hint={`${d?.newThisWeek ?? 0} new this week`}
        />
        <StatTile
          label="In interview"
          icon="event"
          loading={loading}
          value={d?.stageCounts?.INTERVIEW ?? 0}
        />
        <StatTile
          label="Offers out"
          icon="mail"
          loading={loading}
          value={d?.stageCounts?.OFFER ?? 0}
        />
        <StatTile
          label="Hired"
          icon="check_circle"
          loading={loading}
          value={d?.stageCounts?.HIRED ?? 0}
        />
        <StatTile
          label="Average AI match"
          icon="auto_awesome"
          loading={loading}
          value={d?.avgScore == null ? "–" : `${d.avgScore}%`}
          hint={d?.unscored ? `${d.unscored} not scored yet` : undefined}
        />
      </div>

      {!loading && d && (
        <>
          <Suspense fallback={chartsLoading}>
            <CandidateInsights summary={d} />
          </Suspense>

          <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-card">
            <h2 className="font-semibold">Top matches still in play</h2>
            <p className="text-sm text-slate-500">
              Highest AI match among active candidates
            </p>
            <ul className="mt-3 divide-y divide-slate-100">
              {topMatches.length === 0 && (
                <li className="py-3 text-sm text-slate-500">
                  No active candidates yet.
                </li>
              )}
              {topMatches.map((c) => (
                <li key={c.id}>
                  <Link
                    to={`/candidates/${c.id}`}
                    className="flex flex-wrap items-center justify-between gap-3 py-3 hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-container text-xs font-semibold text-white">
                        {getInitials(c.name)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{c.name}</p>
                        <p className="text-xs text-slate-500">{c.job}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <ScoreBadge score={c.aiScore} />
                      <StageBadge stage={c.stage} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      {isAdmin && (
        <Suspense fallback={chartsLoading}>
          <UsagePanel />
        </Suspense>
      )}
    </div>
  );
}
