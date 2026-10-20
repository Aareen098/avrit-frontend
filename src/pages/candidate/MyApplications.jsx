import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMyApplications } from "@/api/applications.api";
import { MESSAGES, Progress, StatusPill } from "@/features/candidate/status";
import { useAuthStore } from "@/store/authStore";
import Button from "@/components/ui/Button";
import Icon from "@/components/common/Icon";

export default function MyApplications() {
  const user = useAuthStore((s) => s.user);
  const {
    data = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["my-applications", user.email],
    queryFn: () => getMyApplications(user.email),
  });

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            My applications
          </h1>
          <p className="mt-1 text-slate-500">
            Track where each application stands.
          </p>
        </div>
        <Link to="/careers">
          <Button variant="secondary">Browse jobs</Button>
        </Link>
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
            <Link
              to="/careers"
              className="mt-1 inline-block text-sm text-primary"
            >
              See open jobs
            </Link>
          </div>
        ) : (
          data.map((a) => (
            <Link
              key={a.reference}
              to={`/portal/applications/${a.reference}`}
              className="block rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-colors hover:border-slate-300"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold">{a.jobTitle}</h2>
                  <p className="text-sm text-slate-500">
                    Applied {a.appliedAt} · Ref {a.reference}
                  </p>
                </div>
                <StatusPill status={a.status} />
              </div>
              <Progress status={a.status} />
              <p className="mt-4 text-sm text-slate-600">
                {MESSAGES[a.status]}
              </p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
