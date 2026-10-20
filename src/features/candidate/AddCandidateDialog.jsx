import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addCandidate } from "@/api/candidates.api";
import { getJobs } from "@/api/jobs.api";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

const schema = z.object({
  name: z.string().min(2, "Enter the candidate's name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  job: z.string().min(1, "Choose a job"),
  experience: z.number({ error: "Enter years of experience" }).min(0, "Cannot be negative").max(50, "Enter a realistic number"),
  skills: z.string().optional(),
  resume: z.any().refine((f) => !f?.[0] || /\.(pdf|doc|docx)$/i.test(f[0].name), "Use a PDF or Word file"),
});

export default function AddCandidateDialog({ onClose }) {
  const queryClient = useQueryClient();
  const { data: jobs = [] } = useQuery({ queryKey: ["jobs"], queryFn: getJobs });
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { job: "" } });
  const mutation = useMutation({
    mutationFn: addCandidate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      onClose();
    },
  });

  const onSubmit = (d) =>
    mutation.mutate({
      name: d.name,
      email: d.email,
      phone: d.phone,
      job: d.job,
      experience: d.experience,
      skills: (d.skills || "").split(",").map((s) => s.trim()).filter(Boolean),
      resume: d.resume?.[0],
    });

  return (
    <Modal title="Add candidate" onClose={onClose}>
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Full name" {...register("name")} error={errors.name?.message} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Email" type="email" {...register("email")} error={errors.email?.message} />
          <Input label="Phone (optional)" type="tel" {...register("phone")} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Job" placeholder="Choose a job" options={jobs.filter((j) => j.status !== "CLOSED").map((j) => j.title)} {...register("job")} error={errors.job?.message} />
          <Input label="Years of experience" type="number" min="0" {...register("experience", { valueAsNumber: true })} error={errors.experience?.message} />
        </div>
        <Input label="Skills" placeholder="React, Node.js" hint="Separate with commas" {...register("skills")} />
        <div>
          <label htmlFor="add-resume" className="mb-1.5 block text-sm font-medium">Resume (optional)</label>
          <input id="add-resume" type="file" accept=".pdf,.doc,.docx" className="block w-full rounded-lg border border-slate-200 p-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-surface-container file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary" {...register("resume")} />
          {errors.resume && <p className="mt-1 text-xs text-red-600">{errors.resume.message}</p>}
        </div>
        {mutation.isError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">Could not add the candidate. Please try again.</p>}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={mutation.isPending}>Add candidate</Button>
        </div>
      </form>
    </Modal>
  );
}