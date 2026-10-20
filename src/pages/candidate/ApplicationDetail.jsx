import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMyApplication, getMyInterviews } from "@/api/applications.api";
import { MESSAGES, Progress, StatusPill, formatWhen } from "@/features/candidate/status";
import Icon from "@/components/common/Icon";
import { useAuthStore } from "@/store/authStore";

export default function ApplicationDetail() {
  const { reference } = useParams();
  const user = useAuthStore((s) => s.user);
  const appQ = useQuery({ queryKey: ["my-application", reference], queryFn: () => getMyApplication(reference, user.email), retry: false });
  const ivQ = useQuery({ queryKey: ["my-interviews"], queryFn: getMyInterviews });

  if (appQ.isLoading) return <p className="text-slate-500">Loading...</p>;
  if (appQ.isError || !appQ.data)
    return (
      <div className="text-center">
        <p className="text-lg font-semibold">We could not find this application.</p>
        <Link to="/portal/applications" className="mt-3 inline-block text-primary">Back to my applications</Link>
      </div>
    );

  const a = appQ.data;
  const interviews = (ivQ.data ?? []).filter((i) => i.reference === a.reference);

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/portal/applications" className="text-sm text-slate-500 hover:text-on-surface">← My applications</Link>

      <article className="mt-3 rounded-xl border border-slate-200 bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-primary">{a.company}</p>
            <h1 className="text-2xl font-semibold tracking-tight">{a.jobTitle}</h1>
            <p className="mt-1 text-sm text-slate-500">{[a.location, a.jobType].filter(Boolean).join(" · ")}</p>
          </div>
          <StatusPill status={a.status} />
        </div>
        <Progress status={a.status} />
        <p className="mt-4 text-sm text-slate-600">{MESSAGES[a.status]}</p>
      </article>

      {interviews.length > 0 && (
        <section className="mt-4 rounded-xl border border-slate-200 bg-white p-6 shadow-card">
          <h2 className="font-semibold">Interviews</h2>
          <ul className="mt-3 space-y-3">
            {interviews.map((i) => (
              <li key={i.id} className="flex items-start gap-3">
                <Icon name="event" className="mt-0.5 text-slate-400" />
                <div>
                  <p className="font-medium">{formatWhen(i.date, i.time)}</p>
                  <p className="text-sm text-slate-500">{i.type}{i.interviewer ? ` with ${i.interviewer}` : ""}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-4 rounded-xl border border-slate-200 bg-white p-6 shadow-card">
        <h2 className="font-semibold">Your application</h2>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
          <div><dt className="text-slate-500">Applied on</dt><dd className="font-medium">{a.appliedAt}</dd></div>
          <div><dt className="text-slate-500">Reference</dt><dd className="font-medium">{a.reference}</dd></div>
          <div><dt className="text-slate-500">Resume sent</dt><dd className="break-all font-medium">{a.resumeName || "-"}</dd></div>
        </dl>
        {a.coverNote && (
          <>
            <h3 className="mt-5 text-sm font-medium text-slate-500">Your note</h3>
            <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{a.coverNote}</p>
          </>
        )}
      </section>

      <section className="mt-4 rounded-xl border border-slate-200 bg-white p-6 shadow-card">
        <h2 className="font-semibold">About the role</h2>
        <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{a.description || "No description was added for this job."}</p>
        {a.skills?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {a.skills.map((s) => (
              <span key={s} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{s}</span>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}