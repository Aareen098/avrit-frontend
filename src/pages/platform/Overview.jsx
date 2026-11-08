import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getOverview } from "@/api/platform.api";
import Icon from "@/components/common/Icon";
import { formatBytes, formatCount, formatInr } from "@/utils/format";

// Chart code (ECharts) is a separate download, fetched only for the platform owner.
const OverviewCharts = lazy(() => import("@/components/charts/OverviewCharts"));

function Stat({ icon, label, value, hint }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container text-primary-container">
          <Icon name={icon} />
        </span>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export default function Overview() {
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ["platform", "overview"], queryFn: getOverview });

  if (isLoading) return <p className="text-slate-500">Loading...</p>;
  if (isError)
    return (
      <p className="text-slate-600">
        Could not load the overview.{" "}
        <button onClick={() => refetch()} className="font-medium text-primary-container underline">Try again</button>
      </p>
    );

  const t = data.totals;
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Platform overview</h1>
      <p className="mt-1 text-slate-500">How companies use your platform. Usage and billing only, never their hiring data.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon="apartment" label="Companies" value={t.companies} hint={`${t.activeCompanies} active, ${t.suspendedCompanies} suspended`} />
        <Stat icon="payments" label="Paying companies" value={t.payingCompanies} hint={`${formatInr(t.expectedMonthlyRevenue)} expected per month`} />
        <Stat icon="auto_awesome" label="AI calls this month" value={formatCount(t.aiCallsThisMonth)} hint={`${formatCount(t.llmTokensThisMonth)} tokens`} />
        <Stat icon="description" label="Applications processed this month" value={formatCount(t.applicationsThisMonth)} />
        <Stat icon="mail" label="Emails today" value={`${t.emailsToday} / ${t.emailDailyLimit}`} hint={`${t.emailsThisMonth} this month`} />
        <Stat icon="cloud" label="CV storage" value={formatBytes(t.storageBytes)} />
      </div>

      <Suspense fallback={<div className="mt-6 h-96 animate-pulse rounded-xl bg-slate-100" />}>
        <OverviewCharts data={data} />
      </Suspense>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-card">
        <h2 className="text-sm font-semibold">Biggest AI users this month</h2>
        <div className="mt-3 divide-y divide-slate-100">
          {data.topCompanies.length === 0 && <p className="py-3 text-sm text-slate-500">No companies yet.</p>}
          {data.topCompanies.map((c) => (
            <Link key={c.id} to={`/platform/companies/${c.id}`} className="flex items-center justify-between py-3 text-sm hover:text-primary-container">
              <span className="font-medium">{c.name}</span>
              <span className="text-slate-500">{formatCount(c.llmTokensThisMonth)} tokens, {c.aiCallsThisMonth} AI calls</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}