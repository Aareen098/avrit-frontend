import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getPublicJob } from "@/api/jobs.api";
import { submitApplication } from "@/api/applications.api";
import Input from "@/components/ui/Input";
import Checkbox from "@/components/ui/Checkbox";
import Button from "@/components/ui/Button";
import Icon from "@/components/common/Icon";

const MAX_MB = 5;
const schema = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  coverNote: z.string().optional(),
  resume: z
    .any()
    .refine((f) => f?.length === 1, "Upload your resume")
    .refine((f) => !f?.[0] || /\.(pdf|doc|docx)$/i.test(f[0].name), "Use a PDF or Word file")
    .refine((f) => !f?.[0] || f[0].size <= MAX_MB * 1024 * 1024, `File must be under ${MAX_MB} MB`),
  consent: z.boolean().refine((v) => v, "Please accept to continue"),
});

export default function Apply() {
  const { id } = useParams();
  const { data: job, isLoading, isError } = useQuery({ queryKey: ["public-job", id], queryFn: () => getPublicJob(id), retry: false });
  const [reference, setReference] = useState("");
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { consent: false } });

  const mutation = useMutation({
    mutationFn: submitApplication,
    onSuccess: (res) => setReference(res.reference),
    onError: () => setServerError("Could not submit your application. Please try again."),
  });

  if (isLoading) return <p className="text-center text-slate-500">Loading...</p>;
  if (isError || !job)
    return (
      <div className="text-center">
        <p className="text-lg font-semibold">This job is no longer available.</p>
        <Link to="/careers" className="mt-3 inline-block text-primary">See all openings</Link>
      </div>
    );

  if (reference)
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-slate-200 bg-white p-8 text-center shadow-card">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <Icon name="check_circle" className="text-3xl" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold">Application sent</h1>
        <p className="mt-2 text-slate-500">Thanks for applying for {job.title}. Keep this reference to check your status.</p>
        <p className="mt-4 rounded-lg bg-slate-100 py-3 font-mono text-lg font-semibold tracking-wider">{reference}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/status"><Button variant="secondary">Check status</Button></Link>
          <Link to="/careers"><Button>More openings</Button></Link>
        </div>
      </div>
    );

  const onSubmit = (d) => {
    setServerError("");
    mutation.mutate({ job, name: d.name, email: d.email, phone: d.phone, coverNote: d.coverNote, resume: d.resume[0] });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link to={`/careers/${job.id}`} className="text-sm text-slate-500 hover:text-on-surface">← Back to job</Link>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">Apply for {job.title}</h1>
      <p className="mt-1 text-slate-500">{job.department} · {job.location}</p>

      <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-card">
        <Input label="Full name" {...register("name")} error={errors.name?.message} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Email" type="email" {...register("email")} error={errors.email?.message} />
          <Input label="Phone (optional)" type="tel" {...register("phone")} />
        </div>
        <div>
          <label htmlFor="resume" className="mb-1.5 block text-sm font-medium">Resume</label>
          <input
            id="resume"
            type="file"
            accept=".pdf,.doc,.docx"
            aria-invalid={errors.resume ? "true" : undefined}
            className="block w-full rounded-lg border border-slate-200 p-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-surface-container file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary"
            {...register("resume")}
          />
          <p className="mt-1 text-xs text-slate-500">PDF or Word, up to {MAX_MB} MB.</p>
          {errors.resume && <p className="mt-1 text-xs text-red-600">{errors.resume.message}</p>}
        </div>
        <div>
          <label htmlFor="cover" className="mb-1.5 block text-sm font-medium">Cover note (optional)</label>
          <textarea
            id="cover"
            rows={4}
            className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/15"
            {...register("coverNote")}
          />
        </div>
        <Checkbox label="I agree to HireFlow storing my details to process this application." {...register("consent")} error={errors.consent?.message} />

        {serverError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>}
        <Button type="submit" size="lg" fullWidth loading={mutation.isPending}>Submit application</Button>
      </form>
    </div>
  );
}