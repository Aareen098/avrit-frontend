import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { USE_MOCK } from "@/api/auth.api";
import { downloadResume, getCandidate, runAiAnalysis } from "@/api/candidates.api";
import { getSettings } from "@/api/settings.api";
import StageBadge from "@/components/common/StageBadge";
import ScoreBadge from "@/components/common/ScoreBadge";
import Icon from "@/components/common/Icon";
import { getInitials } from "@/utils/format";

function Row({ icon, children }) {
  return (
    <li className="flex items-center gap-3 text-sm text-slate-600">
      <Icon name={icon} className="text-lg text-slate-400" /> {children}
    </li>
  );
}

export default function CandidateProfile() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [downloadError, setDownloadError] = useState("");
  const { data: c, isLoading, isError } = useQuery({ queryKey: ["candidate", id], queryFn: () => getCandidate(id), retry: false });
  const settingsQ = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const showWhy = settingsQ.data?.ai.showExplanation ?? true;

  // "Run AI analysis": the server reads the CV with the AI and sends back the updated candidate.
  const analyse = useMutation({
    mutationFn: () => runAiAnalysis(id),
    onSuccess: (data) => {
      queryClient.setQueryData(["candidate", id], data);
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
  });

  if (isLoading) return <p className="text-slate-500">Loading...</p>;
  if (isError || !c)
    return (
      <div className="text-center">
        <p className="text-lg font-semibold">Candidate not found.</p>
        <Link to="/candidates" className="mt-3 inline-block text-primary">Back to candidates</Link>
      </div>
    );

  const skills = c.skills ?? [];

  async function onDownload() {
    setDownloadError("");
    try {
      await downloadResume(c.id, c.resume);
    } catch {
      setDownloadError("Could not download the resume.");
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/candidates" className="text-sm text-slate-500 hover:text-on-surface">← All candidates</Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-card">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-container text-xl font-semibold text-white">
            {getInitials(c.name)}
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{c.name}</h1>
            <p className="text-slate-500">Applied for {c.job}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!USE_MOCK && c.hasResume && (
            <button
              type="button"
              onClick={() => analyse.mutate()}
              disabled={analyse.isPending}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              <Icon name="auto_awesome" className="text-base" />
              {analyse.isPending ? "Analysing..." : "Run AI analysis"}
            </button>
          )}
          <ScoreBadge score={c.aiScore} />
          <StageBadge stage={c.stage} />
        </div>
      </div>

      {analyse.isError && (
        <p className="mt-3 text-sm text-rose-600">
          {analyse.error.response?.data?.message || "AI analysis failed. Please try again."}
        </p>
      )}

      {c.stage === "REJECTED" && c.rejectionReason && (
        <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <p className="font-semibold">Rejected: {c.rejectionReason}</p>
          {c.rejectionNote && <p className="mt-1">{c.rejectionNote}</p>}
        </div>
      )}

      <div className="mt-5 grid gap-5 md:grid-cols-3">
        <div className="space-y-5 md:col-span-2">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
            <h2 className="font-semibold">Summary</h2>
            <p className="mt-2 text-slate-600">{c.summary || "No summary yet."}</p>
          </section>
          {showWhy && c.match && (
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
              <h2 className="flex items-center gap-2 font-semibold">
                <Icon name="auto_awesome" filled className="text-lg text-primary-container" /> Why this score
              </h2>
              <ul className="mt-3 space-y-1 text-sm text-slate-600">
                {c.match.reasons.map((r) => <li key={r}>• {r}</li>)}
              </ul>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Matched skills</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {c.match.matched.length === 0 && <span className="text-sm text-slate-400">None</span>}
                    {c.match.matched.map((s) => (
                      <span key={s} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        <Icon name="check" className="text-sm" /> {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Missing skills</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {c.match.missing.length === 0 && <span className="text-sm text-slate-400">None</span>}
                    {c.match.missing.map((s) => (
                      <span key={s} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                        <Icon name="close" className="text-sm" /> {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
            <h2 className="font-semibold">Skills</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {skills.length === 0 && <span className="text-sm text-slate-400">No skills added yet.</span>}
              {skills.map((s) => (
                <span key={s} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{s}</span>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
            <h2 className="font-semibold">Contact</h2>
            <ul className="mt-3 space-y-3">
              <Row icon="mail">{c.email}</Row>
              {c.phone && <Row icon="call">{c.phone}</Row>}
              {c.location && <Row icon="location_on">{c.location}</Row>}
              <Row icon="work_history">{c.experience} years experience</Row>
              <Row icon="calendar_today">Applied {c.appliedAt}</Row>
            </ul>
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
            <h2 className="font-semibold">Resume</h2>
            {c.resume ? (
              <>
                <p className="mt-3 flex items-center gap-2 break-all text-sm text-slate-600">
                  <Icon name="description" className="text-lg text-slate-400" /> {c.resume}
                </p>
                {!USE_MOCK && (
                  <button
                    type="button"
                    onClick={onDownload}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    <Icon name="download" className="text-lg" /> Download CV
                  </button>
                )}
                {downloadError && <p className="mt-2 text-sm text-red-600">{downloadError}</p>}
              </>
            ) : (
              <p className="mt-3 text-sm text-slate-400">No resume on file.</p>
            )}
          </section>
        </aside>
      </div>

      {(c.resumeUrl || c.resumeText) && (
        <section className="mt-5 rounded-xl border border-slate-200 bg-white p-6 shadow-card">
          <h2 className="font-semibold">Resume preview</h2>
          {c.resumeUrl ? (
            <iframe src={c.resumeUrl} title="Resume" className="mt-3 h-96 w-full rounded-lg border border-slate-200" />
          ) : (
            <>
              <p className="mt-1 text-xs text-slate-500">Text read from the resume.</p>
              <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-4 font-sans text-sm text-slate-700">{c.resumeText}</pre>
            </>
          )}
        </section>
      )}
    </div>
  );
}