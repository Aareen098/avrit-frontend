import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthLayout from "@/layouts/AuthLayout";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import Checkbox from "@/components/ui/Checkbox";
import GoogleSection from "@/features/auth/GoogleSection";
import DemoAccounts, { DEMO_PASSWORD } from "@/features/auth/DemoAccounts";
import { loginPanel } from "@/features/auth/panels";
import { loginSchema } from "@/features/auth/authSchemas";
import { USE_MOCK, login } from "@/api/auth.api";
import { useAuthStore } from "@/store/authStore";
import { homeFor } from "@/utils/constants";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((s) => s.setSession);
  const [serverError, setServerError] = useState("");
  const [waking, setWaking] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { remember: true },
    mode: "onTouched",
  });

    const signIn = async (data) => {
    setServerError("");
    // The free server sleeps when unused: after a few seconds, tell the visitor why it is slow.
    const timer = setTimeout(() => setWaking(true), 4000);
    try {
      const session = await login(data);
      setSession(session);
      // Go back to the page they wanted, or to their home page.
      navigate(location.state?.from?.pathname || homeFor(session.user.role), { replace: true });
    } catch (err) {
      setServerError(err.message);
    } finally {
      clearTimeout(timer);
      setWaking(false);
    }
  };
  const onSubmit = (data) => signIn(data);
  const [demoBusy, setDemoBusy] = useState(false);
  const onDemo = async (email) => {
    setDemoBusy(true);
    await signIn({ email, password: DEMO_PASSWORD, remember: true });
    setDemoBusy(false);
  };

  return (
    <AuthLayout panel={loginPanel} tag="ATS">
      <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mb-8 mt-2 text-slate-500">
        Sign in to see your jobs, candidates and interviews.
      </p>

      <GoogleSection />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input label="Email" icon="mail" type="email" placeholder="you@company.com" {...register("email")} error={errors.email?.message} />
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="login-password" className="text-sm font-medium text-on-surface">
              Password
            </label>
            <Link to="/forgot-password" className="text-sm font-medium text-primary-container hover:underline">
              Forgot password?
            </Link>
          </div>
          <PasswordInput id="login-password" placeholder="Your password" {...register("password")} error={errors.password?.message} />
        </div>
        <Checkbox label="Keep me signed in for 30 days" {...register("remember")} />

        <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
          Sign in
        </Button>
        {waking && (
          <p role="status" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            The server is waking up (free hosting). This can take up to a minute the first time, please wait.
          </p>
        )}
        {serverError && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {serverError}
          </p>
        )}
      </form>

      <DemoAccounts onPick={onDemo} disabled={demoBusy || isSubmitting} />
      {USE_MOCK && (
        <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-surface-container-low p-4 text-xs text-slate-600">
          <p className="font-semibold text-on-surface">Demo mode (no backend yet)</p>
          <p className="mt-1">
            Use any password. The email decides the role: <b>admin@</b>, <b>recruiter@</b>,{" "}
            <b>manager@</b> or <b>candidate@</b> anything.
          </p>
        </div>
      )}

      <div className="mt-8 space-y-2 text-center text-sm text-slate-500">
        <p>
          Looking for a job?{" "}
          <Link to="/register" className="font-medium text-primary-container hover:underline">
            Create a candidate account
          </Link>
        </p>
        <p>
          Hiring?{" "}
          <Link to="/register/company" className="font-medium text-primary-container hover:underline">
            Set up an employer workspace
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
