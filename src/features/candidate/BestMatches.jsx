import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { aiError, getBestMatches } from "@/api/candidateAi.api";
import { Chips, FitScore, WAIT_TEXT } from "@/features/candidate/aiParts";
import Button from "@/components/ui/Button";

// Ranks all open jobs (not applied to yet) against the resume on the profile.
export default function BestMatches({ hasResume }) {
  const run = useMutation({ mutationFn: getBestMatches });
  const list = run.data;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Best matches for you</h2>
          <p className="text-sm text-slate-500">AI compares your resume with all open jobs you have not applied to yet.</p>
        </div>
        {hasResume ? (
          <Button loading={run.isPending} onClick={() => run.mutate()}>{list ? "Refresh matches" : "Find my best matches"}</Button>
        ) : (
          <Link to="/portal/profile"><Button variant="secondary">Add your resume first</Button></Link>
        )}
      </div>

      {run.isPending && <p className="mt-4 text-sm text-slate-500">{WAIT_TEXT}</p>}
      {run.isError && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{aiError(run.error)}</p>}
      {list && list.length === 0 && <p className="mt-4 text-sm text-slate-500">No open jobs left to match. You have applied to all of them, or none are open right now.</p>}

      {list && list.length > 0 && (
        <ul className="mt-4 divide-y divide-slate-100">
          {list.map((m) => (
            <li key={m.jobId} className="py-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{m.title}</p>
                  <p className="text-sm text-slate-500">{[m.company, m.location, m.type].filter(Boolean).join(" · ")}</p>
                </div>
                <FitScore score={m.score} />
              </div>
              {m.reason && <p className="mt-2 text-sm text-slate-600">{m.reason}</p>}
              {m.missing?.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-500">Not shown in your resume:</span>
                  <Chips items={m.missing} tone="red" />
                </div>
              )}
              <Link to={`/careers/${m.jobId}`} className="mt-2 inline-block text-sm font-medium text-primary hover:underline">View job and apply</Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}