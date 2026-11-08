// Turns the candidates list into the numbers behind the dashboard charts. Runs in the browser on the
// company's own candidates (the API only ever returns this company's people).
export const STAGE_KEYS = ["APPLIED", "SCREENING", "INTERVIEW", "OFFER", "HIRED", "REJECTED"];
export const STAGE_COLORS = { APPLIED: "#2a78d6", SCREENING: "#6250d6", INTERVIEW: "#eb6834", OFFER: "#eda100", HIRED: "#1baf7a", REJECTED: "#e34948" };
const PIPELINE = ["APPLIED", "SCREENING", "INTERVIEW", "OFFER", "HIRED"];

const SCORE_COLORS = ["#94a3b8", "#64748b", "#eda100", "#1baf7a"];

export function fromSummary(d) {
  const stageCounts = Object.fromEntries(STAGE_KEYS.map((k) => [k, d.stageCounts?.[k] ?? 0]));
  const funnel = PIPELINE.map((key, i) => ({
    key,
    value: PIPELINE.slice(i).reduce((s, k) => s + stageCounts[k], 0),
  }));
  const perDay = d.perDay.map((p) => ({
    key: p.date,
    label: new Date(`${p.date}T00:00:00`).toLocaleDateString("en", { month: "short", day: "numeric" }),
    value: p.value,
  }));
  const average = perDay.map((_, i) => {
    const part = perDay.slice(Math.max(0, i - 6), i + 1);
    return Math.round((part.reduce((s, p) => s + p.value, 0) / part.length) * 10) / 10;
  });
  return {
    total: d.total, stageCounts, funnel, perDay, average, last7: d.newThisWeek,
    avgScore: d.avgScore, unscored: d.unscored,
    scoreBuckets: d.scoreBuckets.map((b, i) => ({ ...b, color: SCORE_COLORS[i] })),
    experience: d.experience, topSkills: d.topSkills,
    byJob: d.byJob.map((j) => ({ ...j, stages: Object.fromEntries(STAGE_KEYS.map((k) => [k, j.stages?.[k] ?? 0])) })),
  };
}