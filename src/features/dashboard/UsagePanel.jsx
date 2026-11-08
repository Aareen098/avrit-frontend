import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCompanyUsage } from "@/api/usage.api";
import ChartCard from "@/components/charts/ChartCard";
import EChart, { echarts } from "@/components/charts/EChart";
import {
  COLORS,
  base,
  gradient,
  xAxis,
  yAxis,
} from "@/components/charts/theme";
import Icon from "@/components/common/Icon";
import { formatBytes, formatCount, formatInr } from "@/utils/format";

const fade = (color) =>
  new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: `${color}66` },
    { offset: 1, color: `${color}00` },
  ]);

// A ring that fills as the plan's allowance is used. Green, then amber, then red. The numbers are printed as well.
function Ring({ title, used, allowed }) {
  const pct = allowed > 0 ? Math.min(100, (used / allowed) * 100) : 0;
  const color =
    used > allowed ? "#e34948" : pct >= 80 ? "#eda100" : COLORS.aqua;
  const option = useMemo(
    () => ({
      ...base,
      series: [
        {
          type: "gauge",
          startAngle: 90,
          endAngle: -270,
          min: 0,
          max: 100,
          radius: "92%",
          center: ["50%", "50%"],
          progress: {
            show: true,
            width: 12,
            roundCap: true,
            itemStyle: { color, shadowColor: `${color}88`, shadowBlur: 10 },
          },
          axisLine: {
            roundCap: true,
            lineStyle: { width: 12, color: [[1, "#e8ecf2"]] },
          },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          pointer: { show: false },
          anchor: { show: false },
          title: { show: false },
          detail: {
            offsetCenter: [0, 0],
            fontSize: 20,
            fontWeight: 600,
            color: COLORS.ink,
            formatter: () => `${used}`,
          },
          data: [{ value: pct }],
        },
      ],
    }),
    [pct, used, color],
  );
  return (
    <div className="text-center">
      <EChart
        option={option}
        height={140}
        label={`${title}: ${used} of ${allowed} used`}
      />
      <p className="-mt-1 text-sm font-medium">{title}</p>
      <p className="text-xs text-slate-500">
        {used} of {allowed} this month
      </p>
    </div>
  );
}

function Tokens({ history }) {
  const option = useMemo(
    () => ({
      ...base,
      tooltip: {
        ...base.tooltip,
        trigger: "axis",
        axisPointer: {
          type: "shadow",
          shadowStyle: { color: "rgba(100,116,139,.08)" },
        },
        valueFormatter: formatCount,
      },
      grid: { left: 44, right: 12, top: 16, bottom: 26 },
      xAxis: xAxis(history.map((h) => h.month)),
      yAxis: yAxis(formatCount),
      series: [
        {
          type: "bar",
          name: "AI tokens",
          barWidth: "46%",
          data: history.map((h) => h.llmTokens),
          itemStyle: {
            color: gradient(COLORS.blue),
            borderRadius: [10, 10, 0, 0],
            shadowColor: `${COLORS.blue}55`,
            shadowBlur: 10,
          },
        },
      ],
    }),
    [history],
  );
  return (
    <EChart option={option} height={240} label="AI tokens used per month" />
  );
}

function Applications({ history }) {
  const option = useMemo(
    () => ({
      ...base,
      tooltip: { ...base.tooltip, trigger: "axis" },
      grid: { left: 36, right: 24, top: 16, bottom: 26 },
      xAxis: { ...xAxis(history.map((h) => h.month)), boundaryGap: false },
      yAxis: { ...yAxis(), minInterval: 1 },
      series: [
        {
          type: "line",
          name: "Applications",
          smooth: 0.35,
          data: history.map((h) => h.applications),
          symbol: "circle",
          symbolSize: 8,
          lineStyle: {
            width: 3,
            color: COLORS.orange,
            shadowColor: `${COLORS.orange}77`,
            shadowBlur: 12,
            shadowOffsetY: 6,
          },
          itemStyle: {
            color: COLORS.orange,
            borderColor: "#fff",
            borderWidth: 2,
          },
          areaStyle: { color: fade(COLORS.orange) },
        },
      ],
    }),
    [history],
  );
  return (
    <EChart
      option={option}
      height={240}
      label="Applications processed per month"
    />
  );
}

// Only the company's Admin sees this (the server refuses everyone else). It shows how the company uses the platform.
export default function UsagePanel() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["company-usage"],
    queryFn: getCompanyUsage,
  });

  if (isLoading)
    return <div className="mt-8 h-64 animate-pulse rounded-xl bg-slate-100" />;
  if (isError || !data)
    return (
      <p className="mt-8 text-sm text-slate-500">
        Usage could not be loaded right now.
      </p>
    );

  const { plan, now, history, invoices } = data;
  const due = invoices
    .filter((i) => i.status === "ISSUED")
    .reduce((s, i) => s + i.totalAmount, 0);

  return (
    <section className="mt-10" aria-labelledby="usage-title">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 id="usage-title" className="text-lg font-semibold tracking-tight">
            Platform usage
          </h2>
          <p className="text-sm text-slate-500">
            How your company uses Avrit this month. Only admins can see this.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-primary-container/20 bg-surface-container px-3 py-1 text-sm font-medium text-primary-container">
          <Icon name="check_circle" className="text-base" /> {plan.label} plan ·{" "}
          {formatInr(plan.priceInr)} / month
        </span>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card lg:col-span-2">
          <h3 className="text-sm font-semibold">Your plan allowance</h3>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <Ring
              title="AI calls"
              used={now.aiCalls}
              allowed={plan.aiCallsIncluded}
            />
            <Ring
              title="Applications"
              used={now.applications}
              allowed={plan.applicationsIncluded}
            />
            <Ring title="Team seats" used={now.seats} allowed={plan.seats} />
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Going over an allowance is not blocked. Extra use is added to the
            next invoice.
          </p>
        </div>

        <div className="grid gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
            <p className="text-sm text-slate-500">AI tokens this month</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight">
              {formatCount(now.llmTokens)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
            <p className="text-sm text-slate-500">Emails sent this month</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight">
              {formatCount(now.emails)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Interview, rejection, job closed and invite emails
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
            <p className="text-sm text-slate-500">CV storage</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight">
              {formatBytes(now.storageBytes)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="AI tokens per month"
          table={{
            head: ["Month", "AI calls", "Tokens", "Emails"],
            rows: history.map((h) => [
              h.month,
              h.aiCalls,
              formatCount(h.llmTokens), h.emails,
            ]),
          }}
        >
          <Tokens history={history} />
        </ChartCard>
        <ChartCard
          title="Applications processed per month"
          table={{
            head: ["Month", "Applications"],
            rows: history.map((h) => [h.month, h.applications]),
          }}
        >
          <Applications history={history} />
        </ChartCard>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">Invoices</h3>
          {due > 0 && (
            <span className="text-sm text-amber-700">
              {formatInr(due)} unpaid
            </span>
          )}
        </div>
        <div className="mt-2 divide-y divide-slate-100">
          {invoices.length === 0 && (
            <p className="py-3 text-sm text-slate-500">No invoices yet.</p>
          )}
          {invoices.map((i) => (
            <div
              key={i.id}
              className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm"
            >
              <span>
                <span className="font-medium">{i.number}</span>{" "}
                <span className="text-slate-500">
                  {i.period} · {i.planCode}
                </span>
              </span>
              <span className="flex items-center gap-3">
                <span className="font-medium">{formatInr(i.totalAmount)}</span>
                <span className="rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                  {{ ISSUED: "Unpaid", PAID: "Paid", VOID: "Void" }[i.status] ||
                    i.status}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
