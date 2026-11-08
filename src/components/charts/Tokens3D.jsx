import { useMemo } from "react";
import "echarts-gl";
import EChart from "@/components/charts/EChart";
import { COLORS, base, reduceMotion } from "@/components/charts/theme";
import { formatCount } from "@/utils/format";

const SERIES = [
  { key: "screening", label: "AI screening", color: COLORS.blue },
  { key: "assistant", label: "Recruiter assistant", color: COLORS.orange },
  { key: "candidate", label: "Candidate AI", color: COLORS.aqua },
];

// A real 3D bar chart (WebGL): drag to rotate, scroll to zoom. Loaded only when the owner switches to it.
export default function Tokens3D({ rows }) {
  const option = useMemo(() => ({
    ...base,
    tooltip: { ...base.tooltip, formatter: (p) => `${p.seriesName}<br/>${rows[p.value[0]].month}: <b>${formatCount(p.value[2])}</b> tokens` },
    xAxis3D: { type: "category", name: "", data: rows.map((r) => r.month), axisLabel: { color: COLORS.muted } },
    yAxis3D: { type: "category", name: "", data: SERIES.map((s) => s.label), axisLabel: { color: COLORS.muted } },
    zAxis3D: { type: "value", name: "", axisLabel: { color: COLORS.muted, formatter: (v) => formatCount(v) } },
    grid3D: {
      boxWidth: 200, boxDepth: 80, boxHeight: 90,
      axisLine: { lineStyle: { color: COLORS.line } }, splitLine: { lineStyle: { color: COLORS.line } },
      axisPointer: { show: false },
      light: { main: { intensity: 1.3, shadow: true, shadowQuality: "medium", alpha: 35, beta: 30 }, ambient: { intensity: 0.45 } },
      viewControl: { alpha: 24, beta: 28, distance: 235, autoRotate: !reduceMotion, autoRotateSpeed: 6, autoRotateAfterStill: 4 },
    },
    series: SERIES.map((s, j) => ({
      type: "bar3D", name: s.label, shading: "realistic", barSize: 10, bevelSize: 0.25, bevelSmoothness: 3,
      data: rows.filter((r) => r[s.key] > 0).map((r) => ({ value: [rows.indexOf(r), j, r[s.key]], itemStyle: { color: s.color } })),
      emphasis: { itemStyle: { color: "#0f172a" } },
    })),
  }), [rows]);
  return <EChart option={option} height={420} label="3D chart of LLM tokens per month for each kind of AI use" />;
}