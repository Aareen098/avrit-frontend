import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMyApplications, getMyInterviews } from "@/api/applications.api";
import { getProfile } from "@/api/profile.api";
import StatTile from "@/features/dashboard/StatTile";
import { StatusPill, formatWhen, todayLocal } from "@/features/candidate/status";
import Button from "@/components/ui/Button";
import Icon from "@/components/common/Icon";
import { useAuthStore } from "@/store/authStore";

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const apps = useQuery({ queryKey: ["my-applications", user.email], queryFn: () => getMyApplications(user.email) });
  const ivs = useQuery({ queryKey: ["my-interviews"], queryFn: getMyInterviews });
  const prof = useQuery({ queryKey: ["profile", user.email], queryFn: () => getProfile(user) });

  const applications = apps.data ?? [];
  const today = todayLocal();
  const upcoming = (ivs.data ?? []).filter((i) => i.date >= today);
  const profile = prof.data;
  const loading = apps.isLoading || ivs.isLoading;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold tracking-tight">Hi, {user.name.split(" ")[0]}</h1>
      <p className="mt-1 text-slate-500">Here is where your job search stands.</p>

      {profile && profile.completeness < 100 && (
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Your profile is {profile.completeness}% complete</h2>
              <p className="text-sm text-slate-500">
                {profile.resumeName ? "A complete profile helps recruiters get to know you." : "Add your resume to apply for jobs in one click."}
              </p>
            </div>
            <Link to="/portal/profile"><Button variant="secondary">Complete profile</Button></Link>
          </div>
          <div className="mt-3 h-2 rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-primary-container" style={{ width: `${profile.completeness}%` }} />
          </div>
        </section>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Applications" icon="description" loading={loading} value={applications.length} />
        <StatTile label="In review" icon="hourglass_top" loading={loading} value={applications.filter((a) => a.status === "IN_REVIEW").length} />
        <StatTile label="Interviews" icon="event" loading={loading} value={upcoming.length} />
        <StatTile label="Offers" icon="celebration" loading={loading} value={applications.filter((a) => a.status === "OFFER").length} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
          <h2 className="font-semibold">Upcoming interviews</h2>
          {ivs.isLoading ? (
            <p className="mt-3 text-sm text-slate-500">Loading...</p>
          ) : upcoming.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">Nothing scheduled yet. We will show interviews here as soon as a company sets one up.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {upcoming.map((i) => (
                <li key={i.id}>
                  <Link to={`/portal/applications/${i.reference}`} className="flex items-start gap-3 py-3 hover:bg-slate-50">
                    <Icon name="event" className="mt-0.5 text-slate-400" />
                    <div>
                      <p className="font-medium">{i.jobTitle}</p>
                      <p className="text-sm text-slate-500">{i.company} · {formatWhen(i.date, i.time)}</p>
                      <p className="text-sm text-slate-500">{i.type}{i.interviewer ? ` with ${i.interviewer}` : ""}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recent applications</h2>
            <Link to="/portal/applications" className="text-sm text-primary hover:underline">See all</Link>
          </div>
          {apps.isLoading ? (
            <p className="mt-3 text-sm text-slate-500">Loading...</p>
          ) : applications.length === 0 ? (
            <div className="mt-3 text-sm text-slate-500">
              You have not applied yet. <Link to="/careers" className="text-primary hover:underline">Browse open jobs</Link>
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {applications.slice(0, 4).map((a) => (
                <li key={a.reference}>
                  <Link to={`/portal/applications/${a.reference}`} className="flex flex-wrap items-center justify-between gap-2 py-3 hover:bg-slate-50">
                    <div>
                      <p className="font-medium">{a.jobTitle}</p>
                      <p className="text-sm text-slate-500">Applied {a.appliedAt}</p>
                    </div>
                    <StatusPill status={a.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface-container-low p-5">
        <div>
          <p className="font-semibold">Looking for your next role?</p>
          <p className="text-sm text-slate-500">New jobs are added by companies all the time.</p>
        </div>
        <Link to="/careers"><Button>Browse jobs</Button></Link>
      </div>
    </div>
  );
}