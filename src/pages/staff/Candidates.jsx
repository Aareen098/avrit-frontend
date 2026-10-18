import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCandidates } from "@/api/candidates.api";
import { getSettings } from "@/api/settings.api";
import AddCandidateDialog from "@/features/candidates/AddCandidateDialog";
import { useAuthStore } from "@/store/authStore";
import { ROLES } from "@/utils/constants";
import StageBadge from "@/components/common/StageBadge";
import ScoreBadge from "@/components/common/ScoreBadge";
import Icon from "@/components/common/Icon";
import Button from "@/components/ui/Button";
import { STAGES } from "@/utils/candidate";
import { getInitials } from "@/utils/format";

export default function Candidates() {
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("ALL");
  const [sort, setSort] = useState("score");
  const [shortlistOnly, setShortlistOnly] = useState(false);
  const [adding, setAdding] = useState(false);
  const role = useAuthStore((st) => st.user?.role);
  const canAdd = role === ROLES.ADMIN || role === ROLES.RECRUITER;
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const threshold = settings?.ai.shortlistThreshold ?? 80;
  const { data = [], isLoading, isError, refetch } = useQuery({ queryKey: ["candidates"], queryFn: getCandidates });

  const q = search.trim().toLowerCase();
  const shown = data
    .filter(
      (c) =>
        (stage === "ALL" || c.stage === stage) &&
        (!shortlistOnly || c.aiScore >= threshold) &&
        (!q || `${c.name} ${c.job} ${c.skills.join(" ")}`.toLowerCase().includes(q))
    )
    .sort((a, b) => (sort === "score" ? (b.aiScore ?? -1) - (a.aiScore ?? -1) : b.appliedAt.localeCompare(a.appliedAt)));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Candidates</h1>
          <p className="mt-1 text-slate-500">Everyone who has applied, ranked by AI match.</p>
        </div>
        {canAdd && <Button onClick={() => setAdding(true)}><Icon name="person_add" className="text-xl" /> Add candidate</Button>}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, job or skill..."
            aria-label="Search candidates"
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/15"
          />
        </div>
        <select
          value={stage}
          onChange={(e) => setStage(e.target.value)}
          aria-label="Filter by stage"
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
        >
          <option value="ALL">All stages</option>
          {Object.entries(STAGES).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Sort by"
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
        >
          <option value="score">Best match first</option>
          <option value="date">Newest first</option>
        </select>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={shortlistOnly} onChange={(e) => setShortlistOnly(e.target.checked)} className="h-4 w-4 accent-primary-container" />
          Shortlisted only ({threshold}%+)
        </label>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
        {isLoading ? (
          <p className="p-10 text-center text-slate-500">Loading candidates...</p>
        ) : isError ? (
          <div className="p-10 text-center">
            <p className="text-red-600">Could not load candidates.</p>
            <Button variant="secondary" size="sm" className="mt-3" onClick={() => refetch()}>Try again</Button>
          </div>
        ) : shown.length === 0 ? (
          <p className="p-10 text-center text-slate-500">No candidates match your filters.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {shown.map((c) => (
              <li key={c.id}>
                <Link to={`/candidates/${c.id}`} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 hover:bg-slate-50 sm:px-6">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container text-sm font-semibold text-white">
                      {getInitials(c.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{c.name}</p>
                      <p className="truncate text-sm text-slate-500">{c.job} · {c.experience} yrs</p>
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
        )}
      </div>

      {adding && <AddCandidateDialog onClose={() => setAdding(false)} />}
    </div>
  );
}