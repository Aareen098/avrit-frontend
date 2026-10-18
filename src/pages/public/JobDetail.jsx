import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPublicJob } from "@/api/jobs.api";
import Button from "@/components/ui/Button";

export default function JobDetail() {
  const { id } = useParams();
  const { data: job, isLoading, isError } = useQuery({ queryKey: ["public-job", id], queryFn: () => getPublicJob(id), retry: false });

  if (isLoading) return <p className="text-center text-slate-500">Loading...</p>;
  if (isError || !job)
    return (
      <div className="text-center">
        <p className="text-lg font-semibold">This job is no longer available.</p>
        <Link to="/careers" className="mt-3 inline-block text-primary">See all openings</Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-3xl">
      <Link to={job.companySlug ? `/c/${job.companySlug}` : "/careers"} className="text-sm text-slate-500 hover:text-on-surface">← All openings</Link>
      <div className="mt-3 rounded-xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
        {job.companyName && <p className="mb-1 text-sm font-medium text-primary">{job.companyName}</p>}
        <h1 className="text-3xl font-semibold tracking-tight">{job.title}</h1>
        <p className="mt-2 text-slate-500">{job.department} · {job.location} · {job.type}</p>

        <h2 className="mt-8 font-semibold">About the role</h2>
        <p className="mt-2 whitespace-pre-line text-slate-600">{job.description || "Details will be shared during the interview process."}</p>

        {job.skills?.length > 0 && (
          <>
            <h2 className="mt-8 font-semibold">Skills</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {job.skills.map((s) => (
                <span key={s} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{s}</span>
              ))}
            </div>
          </>
        )}

        <Link to={`/careers/${job.id}/apply`} className="mt-8 inline-block">
          <Button size="lg">Apply now</Button>
        </Link>
      </div>
    </div>
  );
}