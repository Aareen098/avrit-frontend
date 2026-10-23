import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateJobStatus } from "@/api/jobs.api";
import Button from "@/components/ui/Button";

const CLOSE_WARNING =
  "Close this job?\n\nIt will disappear from the public jobs page. Candidates who have not had any response yet will be removed from the pipeline and told the job was closed. Candidates already in review, interview or offer are not changed.";

// Close / Publish / Reopen button. Admin and Recruiter only (the caller decides who sees it).
export default function JobStatusButton({ job }) {
  const queryClient = useQueryClient();
  const change = useMutation({
    mutationFn: (status) => updateJobStatus(job.id, status),
    onSuccess: () => {
      for (const key of ["jobs", "candidates", "candidate"]) queryClient.invalidateQueries({ queryKey: [key] });
    },
  });
  const set = (status, ask) => {
    if (ask && !window.confirm(ask)) return;
    change.mutate(status);
  };

  return (
    <>
      {job.status === "OPEN" && (
        <Button variant="secondary" size="sm" loading={change.isPending} onClick={() => set("CLOSED", CLOSE_WARNING)}>Close job</Button>
      )}
      {job.status === "DRAFT" && (
        <Button size="sm" loading={change.isPending} onClick={() => set("OPEN")}>Publish</Button>
      )}
      {job.status === "CLOSED" && (
        <Button variant="secondary" size="sm" loading={change.isPending} onClick={() => set("OPEN", "Reopen this job? It will show on the public jobs page again, and candidates who were closed with it go back to Applied.")}>Reopen</Button>
      )}
      {change.isError && (
        <span role="alert" className="text-xs text-red-600">{change.error?.response?.data?.message || "Could not update the job."}</span>
      )}
    </>
  );
}