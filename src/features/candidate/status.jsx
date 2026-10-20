import { cn } from "@/utils/cn";

// What the candidate sees. Friendly wording only, never AI scores.
export const STEPS = ["APPLIED", "IN_REVIEW", "INTERVIEW", "OFFER"];
export const LABELS = { APPLIED: "Received", IN_REVIEW: "In review", INTERVIEW: "Interview", OFFER: "Offer", REJECTED: "Closed" };
export const MESSAGES = {
  APPLIED: "We have your application and will review it soon.",
  IN_REVIEW: "Our team is reviewing your application.",
  INTERVIEW: "Great news! We would like to talk to you. Check your interview details.",
  OFFER: "Congratulations! An offer is on its way.",
  REJECTED: "Thank you for your interest. We decided not to move forward this time.",
};
const PILLS = {
  APPLIED: "bg-slate-100 text-slate-700",
  IN_REVIEW: "bg-amber-50 text-amber-700",
  INTERVIEW: "bg-blue-50 text-blue-700",
  OFFER: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-slate-100 text-slate-500",
};

export function StatusPill({ status }) {
  return <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", PILLS[status])}>{LABELS[status]}</span>;
}

export function Progress({ status }) {
  if (status === "REJECTED") return null;
  const current = STEPS.indexOf(status);
  return (
    <ol className="mt-4 flex items-center gap-1 sm:gap-2" aria-label="Progress">
      {STEPS.map((s, i) => (
        <li key={s} className="flex flex-1 flex-col gap-1">
          <span className={cn("h-1.5 rounded-full", i <= current ? "bg-primary-container" : "bg-slate-200")} />
          <span className={cn("text-[11px] sm:text-xs", i === current ? "font-semibold text-on-surface" : "text-slate-400")}>{LABELS[s]}</span>
        </li>
      ))}
    </ol>
  );
}

// "Sat 24 Oct, 11:00"
export function formatWhen(date, time) {
  return new Date(`${date}T${time}`).toLocaleString([], { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

// Today as YYYY-MM-DD in the visitor's own time zone.
export const todayLocal = () => new Date().toLocaleDateString("en-CA");