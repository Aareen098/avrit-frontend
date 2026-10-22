import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { downloadMyResume, getProfile, saveProfile } from "@/api/profile.api";
import { useAuthStore } from "@/store/authStore";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Icon from "@/components/common/Icon";
import ResumeReview from "@/features/candidate/ResumeReview";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  headline: z.string().max(120, "Keep it under 120 characters").optional(),
  location: z.string().max(100).optional(),
  phone: z.string().max(30).optional(),
  about: z.string().max(500, "Keep it under 500 characters").optional(),
  linkedin: z.string().max(200).optional(),
  github: z.string().max(200).optional(),
  portfolio: z.string().max(200).optional(),
});

function ProfileForm({ user, profile }) {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [fileKey, setFileKey] = useState(0);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: profile });
  const mutation = useMutation({
    mutationFn: saveProfile,
    onSuccess: (saved) => {
      updateUser({ name: saved.name });
      setFile(null);
      setFileKey((k) => k + 1);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
  const download = useMutation({ mutationFn: () => downloadMyResume(profile.resumeName || "resume") });

  const pick = (e) => {
    const f = e.target.files[0];
    setFileError("");
    mutation.reset();
    if (!f) return setFile(null);
    if (!/\.(pdf|doc|docx)$/i.test(f.name)) return setFileError("Use a PDF or Word file");
    if (f.size > 5 * 1024 * 1024) return setFileError("File must be under 5 MB");
    setFile(f);
  };

  const textarea = "w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/15";
  const errorText = mutation.error?.response?.data?.message || (mutation.isError ? "Could not save your profile" : "");

  return (
    <form noValidate onSubmit={handleSubmit((values) => !fileError && mutation.mutate({ user, values, resumeFile: file }))} className="mt-6 space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-card">
      <Input label="Full name" {...register("name")} error={errors.name?.message} />
      <Input label="Email" value={user.email} readOnly disabled hint="Your sign-in email cannot be changed here." />
      <Input label="Headline" placeholder="e.g. Full-stack developer (React, Spring Boot)" {...register("headline")} error={errors.headline?.message} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Phone" type="tel" {...register("phone")} error={errors.phone?.message} />
        <Input label="Location" {...register("location")} error={errors.location?.message} />
      </div>
      <div>
        <label htmlFor="about" className="mb-1.5 block text-sm font-medium">About you</label>
        <textarea id="about" rows={4} placeholder="A few lines about your experience and what you are looking for" className={textarea} {...register("about")} />
        {errors.about && <p className="mt-1 text-xs text-red-600">{errors.about.message}</p>}
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <Input label="LinkedIn" placeholder="linkedin.com/in/you" {...register("linkedin")} />
        <Input label="GitHub" placeholder="github.com/you" {...register("github")} />
        <Input label="Portfolio" placeholder="yoursite.com" {...register("portfolio")} />
      </div>

      <div>
        <label htmlFor="resume" className="mb-1.5 block text-sm font-medium">Resume</label>
        <p className="mb-2 text-xs text-slate-500">One resume is kept on your profile and used when you apply. Upload a new file any time to replace it. Applications you already sent keep the resume you sent them.</p>
        {profile.resumeName && (
          <p className="mb-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <Icon name="description" className="text-lg text-slate-400" />
            {file ? `${file.name} (will replace ${profile.resumeName})` : profile.resumeName}
            {!file && (
              <button type="button" onClick={() => download.mutate()} className="text-primary hover:underline">
                {download.isPending ? "Downloading..." : "Download"}
              </button>
            )}
          </p>
        )}
        <input key={fileKey} id="resume" type="file" accept=".pdf,.doc,.docx" onChange={pick}
          className="block w-full rounded-lg border border-slate-200 p-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-surface-container file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary" />
        {fileError && <p className="mt-1 text-xs text-red-600">{fileError}</p>}
        {download.isError && <p className="mt-1 text-xs text-red-600">Could not download your resume.</p>}
      </div>

      <div className="flex items-center justify-end gap-3">
        {mutation.isSuccess && <span role="status" className="text-sm text-emerald-600">Saved</span>}
        {errorText && <span role="alert" className="text-sm text-red-600">{errorText}</span>}
        <Button type="submit" loading={mutation.isPending}>Save profile</Button>
      </div>
    </form>
  );
}

export default function CandidateProfilePage() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, isError } = useQuery({ queryKey: ["profile", user.email], queryFn: () => getProfile(user) });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Your profile</h1>
      <p className="mt-1 text-slate-500">Keep your details up to date so applying is quick.</p>
      {data && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Profile completeness</span>
            <span className="font-medium">{data.completeness}%</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-primary-container" style={{ width: `${data.completeness}%` }} />
          </div>
        </div>
      )}
      {isLoading ? <p className="mt-6 text-slate-500">Loading...</p> : isError ? <p className="mt-6 text-red-600">Could not load your profile.</p> : <><ProfileForm user={user} profile={data} /><ResumeReview key={data.resumeName} hasResume={Boolean(data.resumeName)} /></>}
    </div>
  );
}