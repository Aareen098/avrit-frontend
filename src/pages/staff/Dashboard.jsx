import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getJobs } from "@/api/jobs.api";
import { getCandidates } from "@/api/candidates.api";
import StatTile from "@/features/dashboard/StatTile";
import BarChartCard from "@/features/dashboard/BarChartCard";
import ScoreBadge from "@/components/common/ScoreBadge";
import StageBadge from "@/components/common/StageBadge";
import { useAuthStore } from "@/store/authStore";
import { ROLE_LABELS } from "@/utils/constants";
import { STAGES } from "@/utils/candidate";
import { getInitials } from "@/utils/format";

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const jobsQ = useQuery({ queryKey: ["jobs"], queryFn: getJobs });
  const candQ = useQuery({ queryKey: ["candidates"], queryFn: getCandidates });
  const jobs = jobsQ.data ?? [];
  const candidates = candQ.data ?? [];
  const loading = jobsQ.isLoading || candQ.isLoading;

  const byStage = Object.entries(STAGES).map(([key, s]) => ({
    label: s.label,
    value: candidates.filter((c) => c.stage === key).length,
  }));
  const jobTitles = [...new Set(candidates.map((c) => c.job))];
  const byJob = jobTitles
    .map((t) => ({ label: t, value: candidates.filter((c) => c.job === t).length }))
    .sort((a, b) => b.value - a.value);
  const topMatches = [...candidates]
    .filter((c) => c.stage !== "HIRED" && c.stage !== "REJECTED")
    .sort((a, b) => b.aiScore - a.aiScore)
    .slice(0, 4);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {user.name}</h1>
      <p className="mt-1 text-slate-500">You are signed in as {ROLE_LABELS[user.role] || user.role}. Here is your hiring at a glance.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Open jobs" icon="work" loading={loading} value={jobs.filter((j) => j.status === "OPEN").length} />
        <StatTile label="Candidates" icon="group" loading={loading} value={candidates.length} />
        <StatTile label="In interview" icon="event" loading={loading} value={candidates.filter((c) => c.stage === "INTERVIEW").length} />
        <StatTile label="Hired" icon="check_circle" loading={loading} value={candidates.filter((c) => c.stage === "HIRED").length} />
      </div>

      {!loading && (
        <>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <BarChartCard title="Candidates by stage" subtitle="Where everyone is in the pipeline" rows={byStage} />
            <BarChartCard title="Candidates by job" subtitle="Applicants per open role" rows={byJob} />
          </div>

          <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-card">
            <h2 className="font-semibold">Top matches still in play</h2>
            <p className="text-sm text-slate-500">Highest AI match among active candidates</p>
            <ul className="mt-3 divide-y divide-slate-100">
              {topMatches.map((c) => (
                <li key={c.id}>
                  <Link to={`/candidates/${c.id}`} className="flex flex-wrap items-center justify-between gap-3 py-3 hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-container text-xs font-semibold text-white">
                        {getInitials(c.name)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{c.name}</p>
                        <p className="text-xs text-slate-500">{c.job}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <ScoreBadge score={c.aiScore} />
                      <StageBadge stage={c.stage} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}