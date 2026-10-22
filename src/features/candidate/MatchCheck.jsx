import { useMutation } from "@tanstack/react-query";
import { aiError, getJobMatch } from "@/api/candidateAi.api";
import { Chips, FitScore, List, WAIT_TEXT } from "@/features/candidate/aiParts";
import Button from "@/components/ui/Button";

// "How well do I match this job?" - used on the job page.
export default function MatchCheck({ jobId }) {
  const run = useMutation({ mutationFn: () => getJobMatch(jobId) });
  const r = run.data;

  return (
    <div className="mt-6 rounded-lg bg-surface-container-low p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium">Not sure if this job fits you?</p>
        <Button variant="secondary" size="sm" loading={run.isPending} onClick={() => run.mutate()}>
          {r ? "Check again" : "How well do I match?"}
        </Button>
      </div>
      {run.isPending && <p className="mt-3 text-sm text-slate-500">{WAIT_TEXT}</p>}
      {run.isError && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{aiError(run.error)}</p>}
      {r && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <FitScore score={r.score} />
            <span className="text-sm text-slate-700">{r.verdict}</span>
          </div>
          {r.matched?.length > 0 && (
            <div>
              <h3 className="mb-1 text-sm font-semibold">Your resume shows</h3>
              <Chips items={r.matched} tone="green" />
            </div>
          )}
          {r.missing?.length > 0 && (
            <div>
              <h3 className="mb-1 text-sm font-semibold">Not shown in your resume</h3>
              <Chips items={r.missing} tone="red" />
            </div>
          )}
          <List title="Before you apply" items={r.tips} />
        </div>
      )}
    </div>
  );
}