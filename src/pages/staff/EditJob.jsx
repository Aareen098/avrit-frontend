import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getJobs, updateJob } from "@/api/jobs.api";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

const schema = z.object({
  title: z.string().min(3, "Enter a job title"),
  department: z.string().min(1, "Choose a department"),
  location: z.string().min(2, "Enter a location"),
  type: z.string().min(1, "Choose a job type"),
  skills: z.string().optional(),
  description: z.string().min(20, "Write at least 20 characters"),
});
const DEPARTMENTS = ["Engineering", "Design", "Marketing", "Sales", "People", "Finance"];
const TYPES = ["Full-time", "Part-time", "Contract", "Internship"];

function EditForm({ job }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type,
      skills: (job.skills ?? []).join(", "),
      description: job.description ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data) => updateJob(job.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      navigate(`/jobs/${job.id}`);
    },
    onError: (err) => setServerError(err?.response?.data?.message || "Could not save the job. Please try again."),
  });

  const submit = handleSubmit((data) => {
    setServerError("");
    const skills = (data.skills || "").split(",").map((s) => s.trim()).filter(Boolean);
    mutation.mutate({ ...data, skills });
  });

  return (
    <form noValidate onSubmit={submit} className="mt-6 space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-card">
      <Input label="Job title" {...register("title")} error={errors.title?.message} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Select label="Department" options={[...new Set([...DEPARTMENTS, job.department])]} {...register("department")} error={errors.department?.message} />
        <Select label="Job type" options={[...new Set([...TYPES, job.type])]} {...register("type")} error={errors.type?.message} />
      </div>
      <Input label="Location" {...register("location")} error={errors.location?.message} />
      <Input label="Skills" hint="Separate with commas" {...register("skills")} />
      <div>
        <label htmlFor="job-desc" className="mb-1.5 block text-sm font-medium">Description</label>
        <textarea
          id="job-desc"
          rows={7}
          aria-invalid={errors.description ? "true" : undefined}
          className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/15"
          {...register("description")}
        />
        {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
      </div>

      {serverError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>}

      <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
        <Link to={`/jobs/${job.id}`}><Button type="button" variant="secondary">Cancel</Button></Link>
        <Button type="submit" loading={mutation.isPending}>Save changes</Button>
      </div>
    </form>
  );
}

export default function EditJob() {
  const { id } = useParams();
  const { data: jobs, isLoading, isError } = useQuery({ queryKey: ["jobs"], queryFn: getJobs });

  if (isLoading) return <p className="text-slate-500">Loading...</p>;
  if (isError) return <p className="text-red-600">Could not load this job.</p>;
  const job = (jobs ?? []).find((j) => String(j.id) === id);
  if (!job)
    return (
      <div className="text-center">
        <p className="text-lg font-semibold">Job not found.</p>
        <Link to="/jobs" className="mt-3 inline-block text-primary">Back to jobs</Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-3xl">
      <Link to={`/jobs/${job.id}`} className="text-sm text-slate-500 hover:text-on-surface">← Back to job</Link>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">Edit job</h1>
      <p className="mt-1 text-slate-500">Changes show on the public page straight away if the job is open.</p>
      <EditForm job={job} />
    </div>
  );
}