import { lazy, Suspense, useState } from "react";
import ChartCard from "@/components/charts/ChartCard";
import { CompaniesChart, EmailGauge, PlanMixChart, RevenueChart, TokensChart } from "@/components/charts/PlatformCharts";
import { formatCount, formatInr } from "@/utils/format";

// The real 3D chart (WebGL) is a separate download, fetched only when the owner switches to it.
const Tokens3D = lazy(() => import("@/components/charts/Tokens3D"));

// Everything on the Overview page that is a chart. Loaded as one piece, only for the platform owner.
export default function OverviewCharts({ data }) {
  const [view, setView] = useState("2d");
  const t = data.totals;

  const tokenTable = {
    head: ["Month", "Screening", "Assistant", "Candidate"],
    rows: data.tokensByMonth.map((p) => [p.month, formatCount(p.screening), formatCount(p.assistant), formatCount(p.candidate)]),
  };

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      <div className="lg:col-span-2">
        <ChartCard
          title="LLM tokens per month"
          table={tokenTable}
          actions={
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-medium" role="group" aria-label="Chart style">
              {[["2d", "Columns"], ["3d", "3D view"]].map(([key, label]) => (
                <button
                  key={key} type="button" onClick={() => setView(key)} aria-pressed={view === key}
                  className={`rounded-md px-3 py-1 ${view === key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          }
        >
          {view === "2d" ? (
            <TokensChart rows={data.tokensByMonth} />
          ) : (
            <Suspense fallback={<p className="flex h-[420px] items-center justify-center text-sm text-slate-400">Loading 3D view...</p>}>
              <Tokens3D rows={data.tokensByMonth} />
              <p className="text-center text-xs text-slate-400">Drag to rotate, scroll to zoom.</p>
            </Suspense>
          )}
        </ChartCard>
      </div>

      <ChartCard title="Invoiced per month" table={{ head: ["Month", "Invoiced"], rows: data.revenueByMonth.map((p) => [p.month, formatInr(p.value)]) }}>
        <RevenueChart points={data.revenueByMonth} />
      </ChartCard>
      <ChartCard title="New companies per month" table={{ head: ["Month", "New companies"], rows: data.companiesByMonth.map((p) => [p.month, p.value]) }}>
        <CompaniesChart points={data.companiesByMonth} />
      </ChartCard>
      <ChartCard title="Companies per plan" table={{ head: ["Plan", "Companies"], rows: data.planMix.map((p) => [p.label, p.value]) }}>
        <PlanMixChart slices={data.planMix} />
      </ChartCard>
      <ChartCard title="Emails sent today">
        <EmailGauge sent={t.emailsToday} limit={t.emailDailyLimit} />
        <p className="text-center text-xs text-slate-500">{t.emailsThisMonth} this month. Brevo's free plan allows {t.emailDailyLimit} a day.</p>
      </ChartCard>
    </div>
  );
}