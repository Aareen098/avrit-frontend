import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getApplicationStatus } from "@/api/applications.api";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Icon from "@/components/common/Icon";
import { cn } from "@/utils/cn";

const schema = z.object({
  reference: z.string().min(4, "Enter your reference, e.g. HF-ABC123"),
  email: z.string().email("Enter the email you applied with"),
});

const STEPS = [
  { key: "APPLIED", label: "Application received" },
  { key: "IN_REVIEW", label: "Under review" },
  { key: "INTERVIEW", label: "Interview" },
  { key: "OFFER", label: "Offer" },
];

export default function ApplicationStatus() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setError("");
    setResult(null);
    try {
      setResult(await getApplicationStatus(data));
    } catch (err) {
      setError(err.message);
    }
  };

  const rejected = result?.status === "REJECTED";
  const current = STEPS.findIndex((s) => s.key === result?.status);

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight">Check your application</h1>
      <p className="mt-1 text-slate-500">Enter the reference you received after applying.</p>

      <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-card">
        <Input label="Reference" placeholder="HF-ABC123" {...register("reference")} error={errors.reference?.message} />
        <Input label="Email" type="email" {...register("email")} error={errors.email?.message} />
        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <Button type="submit" fullWidth loading={isSubmitting}>Check status</Button>
        <p className="rounded-lg border border-dashed border-slate-300 p-3 text-xs text-slate-500">
          Demo: reference <b>HF-DEMO01</b> with email <b>demo@example.com</b>.
        </p>
      </form>

      {result && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-card">
          <p className="font-semibold">{result.jobTitle}</p>
          <p className="text-sm text-slate-500">Applied on {result.appliedAt}</p>
          {rejected ? (
            <p className="mt-5 rounded-lg bg-slate-100 p-4 text-sm text-slate-700">
              Thank you for your interest. We have decided not to move forward with your application this time.
            </p>
          ) : (
            <ol className="mt-5 space-y-4">
              {STEPS.map((s, i) => {
                const done = i <= current;
                return (
                  <li key={s.key} className="flex items-center gap-3">
                    <span className={cn("flex h-7 w-7 items-center justify-center rounded-full", done ? "bg-primary-container text-white" : "bg-slate-100 text-slate-400")}>
                      <Icon name={done ? "check" : "circle"} className="text-base" />
                    </span>
                    <span className={cn("text-sm", done ? "font-semibold" : "text-slate-400")}>{s.label}</span>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}