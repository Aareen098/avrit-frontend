import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createJob } from "@/api/jobs.api";
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

export default function CreateJob() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { department: "", type: "" } });

  const mutation = useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      navigate("/jobs");
    },
    onError: () => setServerError("Could not save the job. Please try again."),
  });

  const submit = (status) =>
    handleSubmit((data) => {
      setServerError("");
      const skills = (data.skills || "").split(",").map((s) => s.trim()).filter(Boolean);
      mutation.mutate({ ...data, skills, status });
    });

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/jobs" className="text-sm text-slate-500 hover:text-on-surface">← Back to jobs</Link>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">Create a job</h1>
      <p className="mt-1 text-slate-500">Fill in the details. You can save it as a draft first.</p>

      <form noValidate onSubmit={submit("OPEN")} className="mt-6 space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-card">
        <Input label="Job title" placeholder="e.g. Senior Frontend Engineer" {...register("title")} error={errors.title?.message} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Select label="Department" options={["Engineering", "Design", "Marketing", "Sales", "People", "Finance"]} {...register("department")} error={errors.department?.message} />
          <Select label="Job type" options={["Full-time", "Part-time", "Contract", "Internship"]} {...register("type")} error={errors.type?.message} />
        </div>
        <Input label="Location" placeholder="e.g. Remote, Bengaluru" {...register("location")} error={errors.location?.message} />
        <Input label="Skills" placeholder="React, Node.js, SQL" hint="Separate with commas" {...register("skills")} />
        <div>
          <label htmlFor="job-desc" className="mb-1.5 block text-sm font-medium">Description</label>
          <textarea
            id="job-desc"
            rows={7}
            placeholder="What will this person do? What do you expect from them?"
            aria-invalid={errors.description ? "true" : undefined}
            className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/15"
            {...register("description")}
          />
          {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
        </div>

        {serverError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>}

        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
          <Button type="button" variant="secondary" disabled={mutation.isPending} onClick={submit("DRAFT")}>Save as draft</Button>
          <Button type="submit" loading={mutation.isPending}>Publish job</Button>
        </div>
      </form>
    </div>
  );
}