import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getJobs } from "@/api/jobs.api";
import { getCandidates } from "@/api/candidates.api";
import { useAuthStore } from "@/store/authStore";
import { ROLES } from "@/utils/constants";
import JobStatusButton from "@/features/jobs/JobStatusButton";
import ScoreBadge from "@/components/common/ScoreBadge";
import StageBadge from "@/components/common/StageBadge";
import Button from "@/components/ui/Button";
import { cn } from "@/utils/cn";

const STATUS = {
  OPEN: { label: "Open", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  DRAFT: { label: "Draft", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  CLOSED: { label: "Closed", cls: "bg-slate-100 text-slate-600 border-slate-200" },
};

// One job: its description and everyone who applied for it.
export default function JobApplicants() {
  const { id } = useParams();
  const role = useAuthStore((s) => s.user?.role);
  const canManage = role === ROLES.ADMIN || role === ROLES.RECRUITER;
  const jobsQ = useQuery({ queryKey: ["jobs"], queryFn: getJobs });
  const candQ = useQuery({ queryKey: ["candidates"], queryFn: getCandidates });

  if (jobsQ.isLoading || candQ.isLoading) return <p className="text-slate-500">Loading...</p>;
  if (jobsQ.isError || candQ.isError) return <p className="text-red-600">Could not load this job.</p>;

  const job = (jobsQ.data ?? []).find((j) => String(j.id) === id);
  if (!job)
    return (
      <div className="text-center">
        <p className="text-lg font-semibold">Job not found.</p>
        <Link to="/jobs" className="mt-3 inline-block text-primary">Back to jobs</Link>
      </div>
    );

  const people = (candQ.data ?? []).filter((c) => (c.jobId != null ? String(c.jobId) === id : c.job === job.title));

  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/jobs" className="text-sm text-slate-500 hover:text-on-surface">← Jobs</Link>

      <article className="mt-3 rounded-xl border border-slate-200 bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{job.title}</h1>
            <p className="mt-1 text-sm text-slate-500">{job.department} · {job.location} · {job.type} · Posted {job.createdAt}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
                        {canManage && (
              <Link to={`/jobs/${job.id}/edit`}><Button variant="secondary" size="sm">Edit</Button></Link>
            )}
            {canManage && <JobStatusButton job={job} />}
            <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-semibold", STATUS[job.status]?.cls)}>
              {STATUS[job.status]?.label ?? job.status}
            </span>
          </div>
        </div>
        {job.skills?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {job.skills.map((s) => (
              <span key={s} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{s}</span>
            ))}
          </div>
        )}
        <h2 className="mt-5 font-semibold">Job description</h2>
        <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{job.description || "No description was added for this job."}</p>
      </article>

      <section className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
        <h2 className="border-b border-slate-100 px-6 py-4 font-semibold">Candidates ({people.length})</h2>
        {people.length === 0 ? (
          <p className="p-10 text-center text-sm text-slate-500">Nobody has applied for this job yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {people.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 hover:bg-slate-50">
                <div className="min-w-0">
                  <Link to={`/candidates/${c.id}`} className="block truncate font-medium hover:text-primary hover:underline">{c.name}</Link>
                  <p className="text-sm text-slate-500">{c.email} · {c.experience} yrs · Applied {c.appliedAt}</p>
                </div>
                <div className="flex items-center gap-3">
                  <ScoreBadge score={c.aiScore} />
                  {c.stage === "REJECTED" && c.rejectionReason === "Job closed" ? (
                    <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">Job closed</span>
                  ) : (
                    <StageBadge stage={c.stage} />
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}