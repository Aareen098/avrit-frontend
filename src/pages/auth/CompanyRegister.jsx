import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "@/layouts/AuthLayout";
import Icon from "@/components/common/Icon";
import { AccountStep, DetailsStep } from "@/features/auth/CompanySteps";
import { employerPanel } from "@/features/auth/panels";
import { registerCompany } from "@/api/auth.api";
import { useAuthStore } from "@/store/authStore";
import { homeFor } from "@/utils/constants";
import { cn } from "@/utils/cn";

const STEPS = ["Your details", "Company details"];

function Stepper({ step }) {
  return (
    <ol className="mb-8 flex items-center">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = step > n;
        const active = step === n;
        return (
          <li key={label} className="flex flex-1 items-center gap-2 last:flex-none">
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                done && "bg-emerald-500 text-white",
                active && "bg-primary-container text-white",
                !done && !active && "bg-surface-container text-slate-500"
              )}
            >
              {done ? <Icon name="check" className="text-base" /> : n}
            </span>
            <span className={cn("text-sm font-medium", active ? "text-on-surface" : "text-slate-500")}>
              {label}
            </span>
            {i < STEPS.length - 1 && <span className="mx-2 h-px flex-1 bg-slate-200" />}
          </li>
        );
      })}
    </ol>
  );
}

export default function CompanyRegister() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [step, setStep] = useState(1);
  const [account, setAccount] = useState();
  const [serverError, setServerError] = useState("");

  const handleNext = (data) => {
    setAccount(data);
    setStep(2);
  };

  // Creates the company and its first Admin, then signs them straight in.
  const handleCreate = async (details) => {
    setServerError("");
    try {
      const session = await registerCompany({ ...account, ...details });
      setSession(session);
      navigate(homeFor(session.user.role), { replace: true });
    } catch (err) {
      setServerError(err.message);
      // An email problem belongs to step 1, so take them back there.
      if (/email/i.test(err.message)) setStep(1);
    }
  };

  return (
    <AuthLayout panel={employerPanel} tag="For employers">
      <h1 className="text-3xl font-semibold tracking-tight">Set up your employer workspace</h1>
      <p className="mb-8 mt-2 text-slate-500">
        {step === 1
          ? "First, tell us about you."
          : "Now tell us about your company."}
      </p>

      <Stepper step={step} />

      {serverError && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {serverError}
        </p>
      )}

      {step === 1 ? (
        <AccountStep defaultValues={account} onNext={handleNext} />
      ) : (
        <DetailsStep onBack={() => setStep(1)} onSubmit={handleCreate} />
      )}

      <p className="mt-8 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-primary-container hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}