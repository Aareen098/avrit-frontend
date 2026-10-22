import { useMutation } from "@tanstack/react-query";
import { aiError, getResumeFeedback } from "@/api/candidateAi.api";
import { Chips, List, WAIT_TEXT } from "@/features/candidate/aiParts";
import Button from "@/components/ui/Button";

// AI feedback on the resume saved on the profile. Nothing is stored; the result is only shown here.
export default function ResumeReview({ hasResume }) {
  const run = useMutation({ mutationFn: getResumeFeedback });
  const r = run.data;

  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">AI resume review</h2>
          <p className="text-sm text-slate-500">Get honest tips to make your saved resume stronger.</p>
        </div>
        <Button variant="secondary" disabled={!hasResume} loading={run.isPending} onClick={() => run.mutate()}>
          {r ? "Review again" : "Review my resume"}
        </Button>
      </div>
      {!hasResume && <p className="mt-3 text-sm text-slate-500">Upload and save a resume above to use this.</p>}
      {run.isPending && <p className="mt-4 text-sm text-slate-500">{WAIT_TEXT}</p>}
      {run.isError && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{aiError(run.error)}</p>}

      {r && (
        <div className="mt-5 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-semibold">{r.score}</span>
            <span className="text-sm text-slate-500">out of 100</span>
          </div>
          <p className="text-sm text-slate-700">{r.summary}</p>
          <List title="What is working" items={r.strengths} />
          <List title="What to improve" items={r.improvements} />
          {r.missingSections?.length > 0 && (
            <div>
              <h3 className="mb-1 text-sm font-semibold">Sections to add</h3>
              <Chips items={r.missingSections} />
            </div>
          )}
        </div>
      )}
    </section>
  );
}