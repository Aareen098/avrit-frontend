import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCompany, getPlans, setPlan, setSuspended } from "@/api/platform.api";
import Button from "@/components/ui/Button";
import Icon from "@/components/common/Icon";
import { StatusBadge } from "@/pages/platform/Companies";
import { InvoiceStatus } from "@/pages/platform/Billing";
import { formatBytes, formatCount, formatInr } from "@/utils/format";

function Meter({ label, used, allowed }) {
  const pct = allowed > 0 ? Math.min(100, (used / allowed) * 100) : 0;
  const over = used > allowed;
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        <span className={over ? "font-medium text-red-600" : "font-medium"}>{used} / {allowed}</span>
      </div>
      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div className={over ? "h-full bg-red-500" : "h-full bg-primary-container"} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function CompanyDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({ queryKey: ["platform", "company", id], queryFn: () => getCompany(id) });
  const { data: plans = [] } = useQuery({ queryKey: ["platform", "plans"], queryFn: getPlans });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["platform"] });
  const suspend = useMutation({ mutationFn: (suspended) => setSuspended(id, suspended), onSuccess: refresh });
  const changePlan = useMutation({ mutationFn: (code) => setPlan(id, code), onSuccess: refresh });

  if (isLoading) return <p className="text-slate-500">Loading...</p>;
  if (isError || !data) return <p className="text-slate-600">Company not found. <Link to="/platform/companies" className="font-medium text-primary-container underline">Back to companies</Link></p>;

  const c = data.company;
  const plan = data.plan;
  const ask = c.suspended
    ? `Reactivate ${c.name}? Their team can log in again.`
    : `Suspend ${c.name}?\n\nEveryone in this company is signed out and cannot log in until you reactivate it. Their data is kept. Candidates can still see their applications.`;
  const pickPlan = (e) => {
    const code = e.target.value;
    const next = plans.find((p) => p.code === code);
    if (window.confirm(`Move ${c.name} to the ${next?.label} plan (${formatInr(next?.priceInr ?? 0)} per month)?\n\nThis month is invoiced on the plan the company has at the end of the month. Invoices for earlier months keep the plan they had then.`)) {
      changePlan.mutate(code);
    }
  };
  const error = suspend.error || changePlan.error;

  return (
    <div>
      <Link to="/platform/companies" className="inline-flex items-center gap-1 text-sm font-medium text-primary-container hover:underline">
        <Icon name="arrow_back" className="text-base" /> Companies
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{c.name}</h1>
            <StatusBadge suspended={c.suspended} />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {c.industry || "No industry"} · {c.size || "Size not set"} · {data.website} · {data.contactEmail}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            aria-label="Plan"
            value={c.planCode}
            onChange={pickPlan}
            disabled={changePlan.isPending}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
          >
            {plans.map((p) => <option key={p.code} value={p.code}>{p.label} ({formatInr(p.priceInr)})</option>)}
          </select>
          <Button
            variant={c.suspended ? "primary" : "secondary"}
            loading={suspend.isPending}
            onClick={() => window.confirm(ask) && suspend.mutate(!c.suspended)}
          >
            {c.suspended ? "Reactivate" : "Suspend"}
          </Button>
        </div>
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-red-600">{error?.response?.data?.message || "Could not update the company."}</p>}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
          <h2 className="text-sm font-semibold">This month against the {plan.label} plan</h2>
          <div className="mt-4 space-y-4">
            <Meter label="AI calls" used={c.aiCallsThisMonth} allowed={plan.aiCallsIncluded} />
            <Meter label="Applications processed" used={c.applicationsThisMonth} allowed={plan.applicationsIncluded} />
            <Meter label="Team seats" used={c.seats} allowed={plan.seats} />
          </div>
          <p className="mt-4 text-xs text-slate-500">
            {formatCount(c.llmTokensThisMonth)} LLM tokens this month · {formatCount(c.emailsThisMonth)} emails sent this month · {formatBytes(c.storageBytes)} of CVs stored · {c.openJobs} open jobs
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
          <h2 className="text-sm font-semibold">Usage by month</h2>
          <table className="mt-3 w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="py-2 font-medium">Month</th><th className="py-2 text-right font-medium">AI calls</th><th className="py-2 text-right font-medium">Tokens</th><th className="py-2 text-right font-medium">Applications</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.usageByMonth.map((u) => (
                <tr key={u.month}>
                  <td className="py-2">{u.month}</td>
                  <td className="py-2 text-right">{u.aiCalls}</td>
                  <td className="py-2 text-right">{formatCount(u.llmTokens)}</td>
                  <td className="py-2 text-right">{u.applications}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-card">
        <h2 className="text-sm font-semibold">Invoices</h2>
        <div className="mt-3 divide-y divide-slate-100">
          {data.invoices.length === 0 && <p className="py-2 text-sm text-slate-500">No invoices yet. Generate them on the Billing page.</p>}
          {data.invoices.map((i) => (
            <div key={i.id} className="flex items-center justify-between py-2.5 text-sm">
              <span><span className="font-medium">{i.number}</span> <span className="text-slate-500">{i.period} · {i.planCode}</span></span>
              <span className="flex items-center gap-3"><span className="font-medium">{formatInr(i.totalAmount)}</span><InvoiceStatus status={i.status} /></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}