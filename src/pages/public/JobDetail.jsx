import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getPublicJob } from "@/api/jobs.api";
import { applyWithProfile } from "@/api/applications.api";
import { getProfile } from "@/api/profile.api";
import { useAuthStore } from "@/store/authStore";
import { ROLES } from "@/utils/constants";
import Button from "@/components/ui/Button";
import MatchCheck from "@/features/candidate/MatchCheck";

// Logged-in candidates apply in one click with the details and resume saved on their profile.
function ApplyBox({ job }) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isCandidate = user?.role === ROLES.CANDIDATE;
  const profileQ = useQuery({ queryKey: ["profile", user?.email], queryFn: () => getProfile(user), enabled: isCandidate });
  const apply = useMutation({
    mutationFn: () => applyWithProfile({ job, email: user.email }),
    onSuccess: (res) => navigate(`/portal/applications/${res.reference}`),
  });

  if (!isCandidate) {
    return (
      <Link to={`/careers/${job.id}/apply`} className="mt-8 inline-block">
        <Button size="lg">Apply now</Button>
      </Link>
    );
  }
  if (profileQ.isLoading) return <p className="mt-8 text-sm text-slate-500">Loading...</p>;
  if (!profileQ.data?.resumeName) {
    return (
      <div className="mt-8">
        <p className="text-sm text-slate-600">Add your resume to your profile to apply in one click.</p>
        <Link to="/portal/profile" className="mt-3 inline-block"><Button size="lg">Complete my profile</Button></Link>
      </div>
    );
  }
  const message = apply.error?.response?.data?.message || (apply.isError ? "Could not send your application" : "");
  return (
    <div className="mt-8">
      <Button size="lg" loading={apply.isPending} onClick={() => apply.mutate()}>Apply with my profile</Button>
      <p className="mt-2 text-xs text-slate-500">Sends {profileQ.data.resumeName}. <Link to="/portal/profile" className="text-primary hover:underline">Change resume</Link></p>
      {message && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{message}</p>}
      <MatchCheck jobId={job.id} />
    </div>
  );
}

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

        <ApplyBox job={job} />
      </div>
    </div>
  );
}