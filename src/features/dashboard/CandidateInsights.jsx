import { lazy, Suspense, useMemo, useState } from "react";
import ChartCard from "@/components/charts/ChartCard";
import EChart, { echarts } from "@/components/charts/EChart";
import { COLORS, base, gradient, reduceMotion, xAxis, yAxis } from "@/components/charts/theme";
import { STAGES } from "@/utils/candidate";
import { STAGE_COLORS, STAGE_KEYS, fromSummary } from "@/features/dashboard/analytics";

// The 3D view (WebGL) is a separate download, fetched only when someone switches to it.
const JobStage3D = lazy(() => import("@/features/dashboard/JobStage3D"));

const BLUES = ["#a9c8f2", "#6aa3e6", "#2a78d6", "#1a4f99"];   // one hue, light to dark = more experience
const fade = (color) => new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: `${color}66` }, { offset: 1, color: `${color}00` }]);
const legend = (extra = {}) => ({ icon: "roundRect", itemWidth: 10, itemHeight: 10, textStyle: { color: COLORS.muted }, ...extra });

function Funnel({ a }) {
  const option = useMemo(() => ({
    ...base,
    tooltip: { ...base.tooltip, formatter: (p) => `${p.name}: <b>${p.value}</b> candidates` },
    series: [{
      type: "funnel", left: "6%", width: "88%", top: 8, bottom: 8, sort: "none", gap: 4, minSize: "22%", maxSize: "100%",
      label: { show: true, position: "inside", color: "#fff", fontWeight: 600, fontSize: 13, formatter: (p) => `${p.name}  ${p.value}` },
      itemStyle: { borderColor: "#fff", borderWidth: 2, shadowColor: "rgba(15,23,42,.18)", shadowBlur: 12, shadowOffsetY: 4 },
      emphasis: { label: { fontSize: 15 } },
      data: a.funnel.map((f) => ({ name: STAGES[f.key].label, value: f.value, itemStyle: { color: gradient(STAGE_COLORS[f.key]) } })),
    }],
  }), [a]);
  return <EChart option={option} height={300} label="Hiring funnel: how many candidates reached each stage" />;
}

function Applications({ a }) {
  const option = useMemo(() => ({
    ...base,
    legend: legend({ top: 0 }),
    tooltip: { ...base.tooltip, trigger: "axis" },
    grid: { left: 30, right: 14, top: 36, bottom: 26 },
    xAxis: { ...xAxis(a.perDay.map((d) => d.label)), boundaryGap: false, axisLabel: { color: COLORS.muted, interval: 4 } },
    yAxis: { ...yAxis(), minInterval: 1 },
    series: [
      {
        type: "line", name: "Applications", smooth: 0.3, data: a.perDay.map((d) => d.value), symbol: "none",
        lineStyle: { width: 3, color: COLORS.blue, shadowColor: `${COLORS.blue}77`, shadowBlur: 12, shadowOffsetY: 6 },
        areaStyle: { color: fade(COLORS.blue) }, emphasis: { focus: "series" },
      },
      { type: "line", name: "7-day average", smooth: 0.3, data: a.average, symbol: "none", lineStyle: { width: 2, color: COLORS.orange, type: "dashed" } },
    ],
  }), [a]);
  return <EChart option={option} height={300} label="Applications received per day over the last 30 days" />;
}

function StageDonut({ a }) {
  const option = useMemo(() => ({
    ...base,
    tooltip: { ...base.tooltip, formatter: (p) => `${p.name}: <b>${p.value}</b> (${p.percent}%)` },
    legend: legend({ bottom: 0 }),
    title: { text: String(a.total), subtext: "candidates", left: "center", top: "33%", textStyle: { fontSize: 30, fontWeight: 600, color: COLORS.ink }, subtextStyle: { color: COLORS.muted } },
    series: [{
      type: "pie", radius: ["52%", "74%"], center: ["50%", "43%"], padAngle: 2, label: { show: false }, emphasis: { scaleSize: 8 },
      itemStyle: { borderRadius: 10, borderColor: "#fff", borderWidth: 2, shadowColor: "rgba(15,23,42,.16)", shadowBlur: 12, shadowOffsetY: 5 },
      data: STAGE_KEYS.filter((k) => a.stageCounts[k] > 0).map((k) => ({ name: STAGES[k].label, value: a.stageCounts[k], itemStyle: { color: gradient(STAGE_COLORS[k]) } })),
    }],
    ...(reduceMotion ? { animation: false } : {}),
  }), [a]);
  return <EChart option={option} height={300} label="Candidates by pipeline stage" />;
}

function Scores({ a }) {
  const option = useMemo(() => ({
    ...base,
    tooltip: { ...base.tooltip, trigger: "axis", axisPointer: { type: "shadow", shadowStyle: { color: "rgba(100,116,139,.08)" } } },
    grid: { left: 30, right: 12, top: 18, bottom: 28 },
    xAxis: xAxis(a.scoreBuckets.map((b) => b.label)),
    yAxis: { ...yAxis(), minInterval: 1 },
    series: [{
      type: "bar", name: "Candidates", barWidth: "52%",
      data: a.scoreBuckets.map((b) => ({ value: b.value, itemStyle: { color: gradient(b.color), borderRadius: [10, 10, 0, 0], shadowColor: `${b.color}55`, shadowBlur: 10 } })),
      label: { show: true, position: "top", color: COLORS.ink, fontWeight: 600 },
    }],
  }), [a]);
  return <EChart option={option} height={280} label="How many candidates fall into each AI match score range" />;
}

function Experience({ a }) {
  const option = useMemo(() => ({
    ...base,
    tooltip: { ...base.tooltip, formatter: (p) => `${p.name}: <b>${p.value}</b> (${p.percent}%)` },
    legend: legend({ bottom: 0 }),
    series: [{
      type: "pie", radius: ["0%", "70%"], center: ["50%", "44%"], roseType: "radius", padAngle: 2, label: { show: false }, emphasis: { scaleSize: 8 },
      itemStyle: { borderRadius: 8, borderColor: "#fff", borderWidth: 2, shadowColor: "rgba(15,23,42,.16)", shadowBlur: 12, shadowOffsetY: 5 },
      data: a.experience.filter((e) => e.value > 0).map((e) => ({ name: e.label, value: e.value, itemStyle: { color: BLUES[a.experience.indexOf(e)] } })),
    }],
  }), [a]);
  return <EChart option={option} height={280} label="Candidates by years of experience" />;
}

function Skills({ a }) {
  const rows = [...a.topSkills].reverse();
  const option = useMemo(() => ({
    ...base,
    tooltip: { ...base.tooltip, trigger: "axis", axisPointer: { type: "shadow", shadowStyle: { color: "rgba(100,116,139,.08)" } } },
    grid: { left: 90, right: 36, top: 8, bottom: 8 },
    xAxis: { type: "value", show: false },
    yAxis: { type: "category", data: rows.map((r) => r.label), axisTick: { show: false }, axisLine: { show: false }, axisLabel: { color: COLORS.ink } },
    series: [{
      type: "bar", name: "Candidates", barWidth: 14, data: rows.map((r) => r.value),
      itemStyle: { borderRadius: 8, color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: "#6aa3e6" }, { offset: 1, color: COLORS.blue }]) },
      label: { show: true, position: "right", color: COLORS.ink, fontWeight: 600 },
      showBackground: true, backgroundStyle: { color: "#f1f5f9", borderRadius: 8 },
    }],
  }), [rows]);
  return <EChart option={option} height={280} label="The skills that appear most often among candidates" />;
}

function JobsByStage({ a }) {
  const rows = [...a.byJob].reverse();
  const option = useMemo(() => ({
    ...base,
    legend: legend({ top: 0 }),
    tooltip: { ...base.tooltip, trigger: "axis", axisPointer: { type: "shadow", shadowStyle: { color: "rgba(100,116,139,.08)" } } },
    grid: { left: 150, right: 20, top: 40, bottom: 30 },
    xAxis: { type: "value", minInterval: 1, splitLine: { lineStyle: { color: COLORS.line, type: "dashed" } }, axisLabel: { color: COLORS.muted } },
    yAxis: { type: "category", data: rows.map((r) => r.job), axisTick: { show: false }, axisLine: { show: false }, axisLabel: { color: COLORS.ink, width: 140, overflow: "truncate" } },
    series: STAGE_KEYS.map((k) => ({
      type: "bar", name: STAGES[k].label, stack: "jobs", barWidth: 18, data: rows.map((r) => r.stages[k]),
      itemStyle: { color: STAGE_COLORS[k], borderColor: "#fff", borderWidth: 1 }, emphasis: { focus: "series" },
    })),
  }), [rows]);
  return <EChart option={option} height={Math.max(260, rows.length * 44 + 70)} label="Candidates per job, split by pipeline stage" />;
}

export default function CandidateInsights({ summary }) {
  const a = useMemo(() => fromSummary(summary), [summary]);
  const [jobView, setJobView] = useState("2d");
  if (a.total === 0) {
    return <p className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">Charts appear here once candidates start applying.</p>;
  }
  const table = (head, rows) => ({ head, rows });

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      <ChartCard title="Hiring funnel" table={table(["Stage", "Reached"], a.funnel.map((f) => [STAGES[f.key].label, f.value]))}>
        <Funnel a={a} />
        <p className="text-center text-xs text-slate-500">Candidates who reached each stage or later. Rejected candidates are not counted.</p>
      </ChartCard>

      <ChartCard title="Applications, last 30 days" table={table(["Day", "Applications"], a.perDay.filter((d) => d.value > 0).map((d) => [d.label, d.value]))}>
        <Applications a={a} />
      </ChartCard>

      <ChartCard title="Where everyone is now" table={table(["Stage", "Candidates"], STAGE_KEYS.map((k) => [STAGES[k].label, a.stageCounts[k]]))}>
        <StageDonut a={a} />
      </ChartCard>

      <ChartCard title="AI match scores" table={table(["Score range", "Candidates"], a.scoreBuckets.map((b) => [b.label, b.value]))}>
        <Scores a={a} />
        {a.unscored > 0 && <p className="text-center text-xs text-slate-500">{a.unscored} candidate(s) have no score yet.</p>}
      </ChartCard>

      <ChartCard title="Experience level" table={table(["Experience", "Candidates"], a.experience.map((e) => [e.label, e.value]))}>
        <Experience a={a} />
      </ChartCard>

      <ChartCard title="Most common skills" table={table(["Skill", "Candidates"], a.topSkills.map((s) => [s.label, s.value]))}>
        {a.topSkills.length ? <Skills a={a} /> : <p className="py-16 text-center text-sm text-slate-400">No skills found in the resumes yet.</p>}
      </ChartCard>

      <div className="lg:col-span-2">
        <ChartCard
          title="Candidates per job and stage"
          table={table(["Job", ...STAGE_KEYS.map((k) => STAGES[k].label)], a.byJob.map((r) => [r.job, ...STAGE_KEYS.map((k) => r.stages[k])]))}
          actions={
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-medium" role="group" aria-label="Chart style">
              {[["2d", "Bars"], ["3d", "3D view"]].map(([key, label]) => (
                <button key={key} type="button" onClick={() => setJobView(key)} aria-pressed={jobView === key}
                  className={`rounded-md px-3 py-1 ${jobView === key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
                  {label}
                </button>
              ))}
            </div>
          }
        >
          {jobView === "2d" ? (
            <JobsByStage a={a} />
          ) : (
            <Suspense fallback={<p className="flex h-[420px] items-center justify-center text-sm text-slate-400">Loading 3D view...</p>}>
              <JobStage3D rows={a.byJob} />
              <p className="text-center text-xs text-slate-400">Drag to rotate, scroll to zoom.</p>
            </Suspense>
          )}
        </ChartCard>
      </div>
    </div>
  );
}