import { useMemo } from "react";
import EChart, { echarts } from "@/components/charts/EChart";
import { COLORS, base, gradient, reduceMotion, xAxis, yAxis } from "@/components/charts/theme";
import { formatCount, formatInr } from "@/utils/format";

// Colors are fixed per meaning (checked for color-blind safety), so a color always means the same thing.
export const TOKEN_SERIES = [
  { key: "screening", label: "AI screening", color: COLORS.blue },
  { key: "assistant", label: "Recruiter assistant", color: COLORS.orange },
  { key: "candidate", label: "Candidate AI", color: COLORS.aqua },
];
export const PLAN_COLORS = { FREE: COLORS.blue, PRO: COLORS.orange, BUSINESS: COLORS.aqua };

const fade = (color) =>
  new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: `${color}66` }, { offset: 1, color: `${color}00` }]);

// ---- stacked glossy columns, with a legend ----
export function TokensChart({ rows }) {
  const option = useMemo(() => ({
    ...base,
    legend: { top: 0, icon: "roundRect", itemWidth: 10, itemHeight: 10, textStyle: { color: COLORS.muted } },
    tooltip: { ...base.tooltip, trigger: "axis", axisPointer: { type: "shadow", shadowStyle: { color: "rgba(100,116,139,.08)" } }, valueFormatter: formatCount },
    grid: { left: 44, right: 12, top: 40, bottom: 28 },
    xAxis: xAxis(rows.map((r) => r.month)),
    yAxis: yAxis(formatCount),
    series: TOKEN_SERIES.map((s, i, all) => ({
      type: "bar", name: s.label, stack: "tokens", barWidth: "42%", data: rows.map((r) => r[s.key] || 0),
      itemStyle: { color: gradient(s.color), borderColor: "#fff", borderWidth: 1.5, borderRadius: i === all.length - 1 ? [8, 8, 0, 0] : 0 },
      emphasis: { focus: "series" },
    })),
  }), [rows]);
  return <EChart option={option} height={360} label="LLM tokens per month, split by AI screening, recruiter assistant and candidate AI" />;
}

// ---- smooth area with a glow under the line ----
export function RevenueChart({ points }) {
  const option = useMemo(() => ({
    ...base,
    tooltip: { ...base.tooltip, trigger: "axis", valueFormatter: formatInr },
    grid: { left: 56, right: 34, top: 20, bottom: 28 },
    xAxis: { ...xAxis(points.map((p) => p.month)), boundaryGap: false },
    yAxis: yAxis(formatInr),
    series: [{
      type: "line", name: "Invoiced", smooth: 0.35, data: points.map((p) => p.value), symbol: "circle", symbolSize: 9,
      lineStyle: { width: 3.5, color: COLORS.blue, shadowColor: `${COLORS.blue}77`, shadowBlur: 14, shadowOffsetY: 8 },
      itemStyle: { color: COLORS.blue, borderColor: "#fff", borderWidth: 2 },
      areaStyle: { color: fade(COLORS.blue) },
      emphasis: { scale: 1.4 },
    }],
  }), [points]);
  return <EChart option={option} height={280} label="Money invoiced per month" />;
}

// ---- rounded columns with a soft glow ----
export function CompaniesChart({ points }) {
  const option = useMemo(() => ({
    ...base,
    tooltip: { ...base.tooltip, trigger: "axis", axisPointer: { type: "shadow", shadowStyle: { color: "rgba(100,116,139,.08)" } } },
    grid: { left: 36, right: 12, top: 20, bottom: 28 },
    xAxis: xAxis(points.map((p) => p.month)),
    yAxis: { ...yAxis(), minInterval: 1 },
    series: [{
      type: "bar", name: "New companies", barWidth: "46%", data: points.map((p) => p.value),
      itemStyle: { color: gradient(COLORS.orange), borderRadius: [10, 10, 0, 0], shadowColor: `${COLORS.orange}55`, shadowBlur: 12 },
      emphasis: { itemStyle: { color: COLORS.orange } },
    }],
  }), [points]);
  return <EChart option={option} height={280} label="New companies per month" />;
}

// ---- donut with rounded slices; the total sits in the middle ----
export function PlanMixChart({ slices }) {
  const total = slices.reduce((s, d) => s + d.value, 0);
  const option = useMemo(() => ({
    ...base,
    tooltip: { ...base.tooltip, trigger: "item", formatter: (p) => `${p.name}: <b>${p.value}</b> companies (${p.percent}%)` },
    legend: { bottom: 0, icon: "roundRect", itemWidth: 10, itemHeight: 10, textStyle: { color: COLORS.muted } },
    title: { text: String(total), subtext: "companies", left: "center", top: "34%", textStyle: { fontSize: 30, fontWeight: 600, color: COLORS.ink }, subtextStyle: { color: COLORS.muted } },
    series: [{
      type: "pie", radius: ["54%", "76%"], center: ["50%", "44%"], padAngle: 3, avoidLabelOverlap: true,
      itemStyle: { borderRadius: 12, borderColor: "#fff", borderWidth: 2, shadowColor: "rgba(15,23,42,.18)", shadowBlur: 14, shadowOffsetY: 6 },
      label: { show: false },
      emphasis: { scaleSize: 8, label: { show: false } },
      data: slices.map((s) => ({ name: `${s.label} (${s.value})`, value: s.value, itemStyle: { color: gradient(PLAN_COLORS[s.label] || COLORS.muted) } })),
    }],
    animationType: "expansion",
    ...(reduceMotion ? { animation: false } : {}),
  }), [slices, total]);
  return <EChart option={option} height={280} label="Number of companies on each plan" />;
}

// ---- gauge: how much of today's email limit is used. Color shows the status, the number is printed too ----
export function EmailGauge({ sent, limit }) {
  const pct = limit > 0 ? Math.min(100, (sent / limit) * 100) : 0;
  const color = pct >= 90 ? "#e34948" : pct >= 70 ? "#eda100" : COLORS.aqua;
  const status = pct >= 90 ? "Almost at the limit" : pct >= 70 ? "Getting close" : "Plenty left";
  const option = useMemo(() => ({
    ...base,
    series: [{
      type: "gauge", startAngle: 210, endAngle: -30, min: 0, max: 100, radius: "95%", center: ["50%", "62%"],
      progress: { show: true, width: 18, roundCap: true, itemStyle: { color, shadowColor: `${color}88`, shadowBlur: 14 } },
      axisLine: { roundCap: true, lineStyle: { width: 18, color: [[1, "#e8ecf2"]] } },
      axisTick: { show: false }, splitLine: { show: false }, axisLabel: { show: false }, pointer: { show: false }, anchor: { show: false },
      title: { offsetCenter: [0, "30%"], fontSize: 13, color: COLORS.muted },
      detail: { offsetCenter: [0, "-6%"], fontSize: 30, fontWeight: 600, color: COLORS.ink, formatter: () => `${sent}` },
      data: [{ value: pct, name: `of ${limit} today · ${status}` }],
    }],
  }), [pct, sent, limit, color, status]);
  return <EChart option={option} height={260} label={`${sent} of ${limit} emails sent today. ${status}.`} />;
}