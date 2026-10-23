import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSettings, inviteMember, saveAi, saveCompany } from "@/api/settings.api";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { ROLE_LABELS } from "@/utils/constants";
import { cn } from "@/utils/cn";

const TABS = ["Company", "AI shortlisting", "Team"];
const card = "rounded-xl border border-slate-200 bg-white p-6 shadow-card";

function Saved({ show }) {
  return show ? <span role="status" className="text-sm text-emerald-600">Saved</span> : null;
}

const companySchema = z.object({
  name: z.string().min(2, "Enter your company name"),
  website: z.string().url("Enter a full link, e.g. https://acme.com"),
  contactEmail: z.string().email("Enter a valid email"),
});

function CompanyTab({ data }) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(companySchema), defaultValues: data });
  const mutation = useMutation({ mutationFn: saveCompany, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings"] }) });

  return (
    <form noValidate onSubmit={handleSubmit((d) => mutation.mutate(d))} className={cn(card, "space-y-5")}>
      <Input label="Company name" {...register("name")} error={errors.name?.message} />
      <Input label="Website" {...register("website")} error={errors.website?.message} />
      <Input label="Careers contact email" type="email" {...register("contactEmail")} error={errors.contactEmail?.message} />
      <div className="flex items-center justify-end gap-3">
        <Saved show={mutation.isSuccess} />
        <Button type="submit" loading={mutation.isPending}>Save changes</Button>
      </div>
    </form>
  );
}

function AiTab({ data }) {
  const queryClient = useQueryClient();
  const [threshold, setThreshold] = useState(data.shortlistThreshold);
  const [explain, setExplain] = useState(data.showExplanation);
  const mutation = useMutation({
    mutationFn: saveAi,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings"] }),
  });

  return (
    <div className={cn(card, "space-y-6")}>
      <div>
        <label htmlFor="threshold" className="flex items-center justify-between text-sm font-medium">
          Shortlist threshold <span className="text-lg font-semibold text-primary">{threshold}%</span>
        </label>
        <input id="threshold" type="range" min="0" max="100" step="5" value={threshold} onChange={(e) => { setThreshold(+e.target.value); mutation.reset(); }} className="mt-3 w-full accent-primary-container" />
        <p className="mt-1 text-xs text-slate-500">Candidates with an AI match at or above this score count as shortlisted.</p>
      </div>
      <label className="flex cursor-pointer items-start gap-3 text-sm">
        <input type="checkbox" checked={explain} onChange={(e) => { setExplain(e.target.checked); mutation.reset(); }} className="mt-0.5 h-4 w-4 accent-primary-container" />
        <span>
          <span className="font-medium">Show "Why this score" on candidate profiles</span>
          <span className="block text-slate-500">Lists matched and missing skills so reviewers can check the AI.</span>
        </span>
      </label>
      <div className="flex items-center justify-end gap-3">
        <Saved show={mutation.isSuccess} />
        <Button loading={mutation.isPending} onClick={() => mutation.mutate({ shortlistThreshold: threshold, showExplanation: explain })}>Save changes</Button>
      </div>
    </div>
  );
}

const inviteSchema = z.object({ email: z.string().email("Enter a valid email"), role: z.string().min(1, "Choose a role") });

function TeamTab({ team }) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(inviteSchema), defaultValues: { role: "" } });
  const mutation = useMutation({
    mutationFn: inviteMember,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["settings"] }); reset({ email: "", role: "" }); },
  });
  const roleOptions = ["RECRUITER", "HIRING_MANAGER", "ADMIN"];

  return (
    <div className="space-y-5">
      <div className={cn(card, "p-0")}>
        <ul className="divide-y divide-slate-100">
          {team.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 px-6 py-4">
              <div>
                <p className="font-semibold">{m.name}</p>
                <p className="text-sm text-slate-500">{m.email}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">{ROLE_LABELS[m.role] || m.role}</span>
            </li>
          ))}
        </ul>
      </div>
      <form noValidate onSubmit={handleSubmit((d) => mutation.mutate(d))} className={cn(card, "space-y-4")}>
        <h2 className="font-semibold">Invite a teammate</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Email" type="email" {...register("email")} error={errors.email?.message} />
          <Select label="Role" placeholder="Choose a role" options={roleOptions} {...register("role")} error={errors.role?.message} />
        </div>
        <div className="flex items-center justify-end gap-3">
            {mutation.isError && (
            <span role="alert" className="text-sm text-red-600">{mutation.error?.response?.data?.message || "Could not send the invite."}</span>
          )}
          {mutation.isSuccess && <span role="status" className="text-sm text-emerald-600">Invite sent</span>}
          <Button type="submit" loading={mutation.isPending}>Send invite</Button>
        </div>
      </form>
    </div>
  );
}

export default function Settings() {
  const [tab, setTab] = useState(TABS[0]);
  const { data, isLoading, isError } = useQuery({ queryKey: ["settings"], queryFn: getSettings });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-1 text-slate-500">Manage your company, AI shortlisting and team.</p>

      <div className="mt-6 flex gap-1 rounded-lg bg-slate-100 p-1" role="tablist">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
            className={cn("flex-1 rounded-md px-3 py-1.5 text-sm font-medium", tab === t ? "bg-white shadow-card" : "text-slate-500 hover:text-on-surface")}>
            {t}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {isLoading ? <p className="text-slate-500">Loading...</p> : isError ? <p className="text-red-600">Could not load settings.</p> : (
          <>
            {tab === "Company" && <CompanyTab data={data.company} />}
            {tab === "AI shortlisting" && <AiTab data={data.ai} />}
            {tab === "Team" && <TeamTab team={data.team} />}
          </>
        )}
      </div>
    </div>
  );
}