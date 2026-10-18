import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProfile, saveProfile } from "@/api/profile.api";
import { useAuthStore } from "@/store/authStore";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Icon from "@/components/common/Icon";

const schema = z.object({
  name: z.string().min(2, "Enter your full name"),
  phone: z.string().optional(),
  location: z.string().optional(),
  about: z.string().max(500, "Keep it under 500 characters").optional(),
});

function ProfileForm({ user, profile }) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: profile });
  const mutation = useMutation({
    mutationFn: saveProfile,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
  });

  const pick = (e) => {
    const f = e.target.files[0];
    setFileError("");
    mutation.reset();
    if (!f) return setFile(null);
    if (!/\.(pdf|doc|docx)$/i.test(f.name)) return setFileError("Use a PDF or Word file");
    if (f.size > 5 * 1024 * 1024) return setFileError("File must be under 5 MB");
    setFile(f);
  };

  return (
    <form noValidate onSubmit={handleSubmit((values) => !fileError && mutation.mutate({ user, values, resumeFile: file }))} className="mt-6 space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-card">
      <Input label="Full name" {...register("name")} error={errors.name?.message} />
      <Input label="Email" value={user.email} readOnly disabled hint="Your sign-in email cannot be changed here." />
      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Phone" type="tel" {...register("phone")} />
        <Input label="Location" {...register("location")} />
      </div>
      <div>
        <label htmlFor="about" className="mb-1.5 block text-sm font-medium">About you</label>
        <textarea id="about" rows={4} placeholder="A few lines about your experience and what you are looking for"
          className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/15"
          {...register("about")} />
        {errors.about && <p className="mt-1 text-xs text-red-600">{errors.about.message}</p>}
      </div>
      <div>
        <label htmlFor="resume" className="mb-1.5 block text-sm font-medium">Resume</label>
        {profile.resumeName && (
          <p className="mb-2 flex items-center gap-2 text-sm text-slate-600">
            <Icon name="description" className="text-lg text-slate-400" /> Current file: {file ? `${file.name} (new)` : profile.resumeName}
          </p>
        )}
        <input id="resume" type="file" accept=".pdf,.doc,.docx" onChange={pick}
          className="block w-full rounded-lg border border-slate-200 p-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-surface-container file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary" />
        {fileError && <p className="mt-1 text-xs text-red-600">{fileError}</p>}
      </div>
      <div className="flex items-center justify-end gap-3">
        {mutation.isSuccess && <span role="status" className="text-sm text-emerald-600">Saved</span>}
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
      {isLoading ? <p className="mt-6 text-slate-500">Loading...</p> : isError ? <p className="mt-6 text-red-600">Could not load your profile.</p> : <ProfileForm user={user} profile={data} />}
    </div>
  );
}