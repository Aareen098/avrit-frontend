import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMyApplications } from "@/api/applications.api";
import { useAuthStore } from "@/store/authStore";
import Button from "@/components/ui/Button";
import Icon from "@/components/common/Icon";
import { cn } from "@/utils/cn";

// What the candidate sees. Friendly wording only, never AI scores.
const STEPS = ["APPLIED", "IN_REVIEW", "INTERVIEW", "OFFER"];
const LABELS = { APPLIED: "Received", IN_REVIEW: "In review", INTERVIEW: "Interview", OFFER: "Offer" };
const MESSAGES = {
  APPLIED: "We have your application and will review it soon.",
  IN_REVIEW: "Our team is reviewing your application.",
  INTERVIEW: "Great news! We would like to talk to you. Watch your email for details.",
  OFFER: "Congratulations! An offer is on its way.",
  REJECTED: "Thank you for your interest. We decided not to move forward this time.",
};

function Progress({ status }) {
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

export default function MyApplications() {
  const user = useAuthStore((s) => s.user);
  const { data = [], isLoading, isError } = useQuery({ queryKey: ["my-applications", user.email], queryFn: () => getMyApplications(user.email) });

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My applications</h1>
          <p className="mt-1 text-slate-500">Track where each application stands.</p>
        </div>
        <Link to="/careers"><Button variant="secondary">Browse jobs</Button></Link>
      </div>

      <div className="mt-6 space-y-4">
        {isLoading ? (
          <p className="text-slate-500">Loading...</p>
        ) : isError ? (
          <p className="text-red-600">Could not load your applications.</p>
        ) : data.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <Icon name="description" className="text-4xl text-slate-300" />
            <p className="mt-2 font-semibold">No applications yet</p>
            <Link to="/careers" className="mt-1 inline-block text-sm text-primary">See open jobs</Link>
          </div>
        ) : (
          data.map((a) => (
            <article key={a.reference} className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold">{a.jobTitle}</h2>
                  <p className="text-sm text-slate-500">Applied {a.appliedAt} · Ref {a.reference}</p>
                </div>
                {a.status === "REJECTED" && <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">Closed</span>}
              </div>
              <Progress status={a.status} />
              <p className="mt-4 text-sm text-slate-600">{MESSAGES[a.status]}</p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}