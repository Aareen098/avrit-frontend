import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCandidates } from "@/api/candidates.api";
import { scheduleInterview, TODAY } from "@/api/interviews.api";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

const schema = z.object({
  candidateId: z.string().min(1, "Choose a candidate"),
  date: z.string().min(1, "Pick a date").refine((d) => !d || d >= TODAY, "Pick today or a later date"),
  time: z.string().min(1, "Pick a time"),
  type: z.string().min(1, "Choose a type"),
  interviewer: z.string().min(2, "Enter the interviewer's name"),
  notes: z.string().optional(),
});

export default function ScheduleInterviewDialog({ onClose }) {
  const queryClient = useQueryClient();
  const { data: candidates = [] } = useQuery({ queryKey: ["candidates"], queryFn: getCandidates });
  const available = candidates.filter((c) => c.stage !== "HIRED" && c.stage !== "REJECTED");
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { candidateId: "", type: "" } });

  const mutation = useMutation({
    mutationFn: scheduleInterview,
    onSuccess: () => {
      ["interviews", "candidates", "candidate"].forEach((k) => queryClient.invalidateQueries({ queryKey: [k] }));
      onClose();
    },
  });

  const onSubmit = (d) => {
    const c = available.find((x) => String(x.id) === d.candidateId);
    mutation.mutate({ candidateId: c.id, candidateName: c.name, job: c.job, date: d.date, time: d.time, type: d.type, interviewer: d.interviewer, notes: d.notes || "" });
  };

  return (
    <Modal title="Schedule interview" onClose={onClose}>
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="iv-candidate" className="mb-1.5 block text-sm font-medium">Candidate</label>
          <select id="iv-candidate" aria-invalid={errors.candidateId ? "true" : undefined} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/15" {...register("candidateId")}>
            <option value="" disabled>Choose a candidate</option>
            {available.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.job}</option>)}
          </select>
          {errors.candidateId && <p className="mt-1 text-xs text-red-600">{errors.candidateId.message}</p>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Date" type="date" min={TODAY} {...register("date")} error={errors.date?.message} />
          <Input label="Time" type="time" {...register("time")} error={errors.time?.message} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Type" placeholder="Choose a type" options={["Video call", "Phone call", "On-site"]} {...register("type")} error={errors.type?.message} />
          <Input label="Interviewer" {...register("interviewer")} error={errors.interviewer?.message} />
        </div>
        <div>
          <label htmlFor="iv-notes" className="mb-1.5 block text-sm font-medium">Notes (optional)</label>
          <textarea id="iv-notes" rows={3} className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/15" {...register("notes")} />
        </div>
        {mutation.isError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">Could not schedule the interview. Please try again.</p>}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={mutation.isPending}>Schedule</Button>
        </div>
      </form>
    </Modal>
  );
}