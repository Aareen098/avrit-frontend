import { useMemo } from "react";
import "echarts-gl";
import EChart from "@/components/charts/EChart";
import { COLORS, base, reduceMotion } from "@/components/charts/theme";
import { STAGES } from "@/utils/candidate";
import { STAGE_COLORS, STAGE_KEYS } from "@/features/dashboard/analytics";

// A real 3D bar chart (WebGL): jobs on one side, pipeline stages on the other, candidates as the height.
export default function JobStage3D({ rows }) {
  const option = useMemo(() => ({
    ...base,
    tooltip: { ...base.tooltip, formatter: (p) => `${rows[p.value[1]].job}<br/>${STAGES[STAGE_KEYS[p.value[0]]].label}: <b>${p.value[2]}</b> candidates` },
    xAxis3D: { type: "category", name: "", data: STAGE_KEYS.map((k) => STAGES[k].label), axisLabel: { color: COLORS.muted } },
    yAxis3D: { type: "category", name: "", data: rows.map((r) => r.job), axisLabel: { color: COLORS.muted, formatter: (v) => (v.length > 16 ? `${v.slice(0, 15)}...` : v) } },
    zAxis3D: { type: "value", name: "", minInterval: 1, axisLabel: { color: COLORS.muted } },
    grid3D: {
      boxWidth: 200, boxDepth: 90, boxHeight: 70,
      axisLine: { lineStyle: { color: COLORS.line } }, splitLine: { lineStyle: { color: COLORS.line } }, axisPointer: { show: false },
      light: { main: { intensity: 1.3, shadow: true, shadowQuality: "medium", alpha: 35, beta: 30 }, ambient: { intensity: 0.45 } },
      viewControl: { alpha: 26, beta: 24, distance: 240, autoRotate: !reduceMotion, autoRotateSpeed: 6, autoRotateAfterStill: 4 },
    },
    series: [{
      type: "bar3D", name: "Candidates", shading: "realistic", barSize: 12, bevelSize: 0.25, bevelSmoothness: 3,
      data: rows.flatMap((r, j) => STAGE_KEYS.map((k, i) => ({ value: [i, j, r.stages[k]], itemStyle: { color: STAGE_COLORS[k] } }))).filter((d) => d.value[2] > 0),
      emphasis: { itemStyle: { color: "#0f172a" } },
    }],
  }), [rows]);
  return <EChart option={option} height={420} label="3D chart of candidates per job and pipeline stage" />;
}