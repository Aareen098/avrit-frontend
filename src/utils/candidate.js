// Shared by the Candidates list, profile and (later) pipeline.
export const STAGES = {
  APPLIED: { label: "Applied", cls: "bg-slate-100 text-slate-600 border-slate-200" },
  SCREENING: { label: "Screening", cls: "bg-sky-50 text-sky-700 border-sky-200" },
  INTERVIEW: { label: "Interview", cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  OFFER: { label: "Offer", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  HIRED: { label: "Hired", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  REJECTED: { label: "Rejected", cls: "bg-rose-50 text-rose-700 border-rose-200" },
};

// Match score colours from the design system: >=85 green, 65-84 amber, below grey.
export function scoreClass(score) {
  if (score >= 85) return "bg-emerald-50 text-emerald-800 border-emerald-200";
  if (score >= 65) return "bg-amber-50 text-amber-800 border-amber-200";
  return "bg-slate-50 text-slate-600 border-slate-200";
}