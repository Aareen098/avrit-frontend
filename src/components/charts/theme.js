import { echarts } from "@/components/charts/EChart";

// Colors checked for color-blind safety: a color always means the same thing across all charts.
export const COLORS = { blue: "#2a78d6", orange: "#eb6834", aqua: "#1baf7a", ink: "#0f172a", muted: "#64748b", line: "#e2e8f0" };

// Top of the gradient is lighter than the base color, which gives the "glossy" look.
export const gradient = (color, from = 0.55) =>
  new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: mix(color, "#ffffff", from * 0.6) },
    { offset: 1, color },
  ]);

function mix(a, b, t) {
  const p = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const [r, g, bl] = p(a).map((v, i) => Math.round(v + (p(b)[i] - v) * t));
  return `rgb(${r},${g},${bl})`;
}

export const reduceMotion = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export const base = {
  animation: !reduceMotion,
  animationDuration: 900,
  animationEasing: "cubicOut",
  textStyle: { fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif", color: COLORS.muted },
  aria: { enabled: true },
  tooltip: {
    backgroundColor: "#ffffff",
    borderColor: COLORS.line,
    borderWidth: 1,
    padding: [10, 14],
    textStyle: { color: COLORS.ink, fontSize: 13 },
    extraCssText: "box-shadow:0 12px 32px rgba(15,23,42,.14);border-radius:12px;",
  },
};

export const yAxis = (formatter) => ({
  type: "value",
  axisLabel: { color: COLORS.muted, formatter },
  splitLine: { lineStyle: { color: COLORS.line, type: "dashed" } },
});

export const xAxis = (labels) => ({
  type: "category",
  data: labels,
  axisTick: { show: false },
  axisLine: { lineStyle: { color: COLORS.line } },
  axisLabel: { color: COLORS.muted },
});