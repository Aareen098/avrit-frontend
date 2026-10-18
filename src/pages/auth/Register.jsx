import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthLayout from "@/layouts/AuthLayout";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import Checkbox from "@/components/ui/Checkbox";
import GoogleSection from "@/features/auth/GoogleSection";
import PasswordStrength from "@/features/auth/PasswordStrength";
import { candidatePanel } from "@/features/auth/panels";
import { registerSchema } from "@/features/auth/authSchemas";
import { registerCandidate } from "@/api/auth.api";
import { useAuthStore } from "@/store/authStore";
import { homeFor } from "@/utils/constants";

export default function Register() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { terms: false },
    mode: "onTouched",
  });

  const passwordValue = useWatch({ control, name: "password" });

    const onSubmit = async (data) => {
    setServerError("");
    try {
      const session = await registerCandidate(data);
      setSession(session);
      navigate(homeFor(session.user.role), { replace: true });
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <AuthLayout panel={candidatePanel}>
      <h1 className="text-3xl font-semibold tracking-tight">Create your account</h1>
      <p className="mb-8 mt-2 text-slate-500">
        Apply to jobs and follow your application in one place.
      </p>

      <GoogleSection dividerText="or sign up with email" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input label="Full name" icon="person" placeholder="Your full name" {...register("fullName")} error={errors.fullName?.message} />
        <Input label="Email" icon="mail" type="email" placeholder="you@example.com" {...register("email")} error={errors.email?.message} />
        <Input label="Phone number" icon="call" type="tel" placeholder="+91 98765 43210" {...register("phone")} error={errors.phone?.message} />
        <div>
          <PasswordInput label="Password" placeholder="At least 8 characters" {...register("password")} error={errors.password?.message} />
          <PasswordStrength value={passwordValue} />
        </div>
        <PasswordInput label="Confirm password" placeholder="Repeat your password" {...register("confirmPassword")} error={errors.confirmPassword?.message} />
        <Checkbox
          label={
            <>
              I agree to the <span className="font-medium text-primary-container">Terms</span> and{" "}
              <span className="font-medium text-primary-container">Privacy Policy</span>
            </>
          }
          {...register("terms")}
          error={errors.terms?.message}
        />
        <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
          Create account
        </Button>
        {serverError && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {serverError}
          </p>
        )}
      </form>

      <div className="mt-8 space-y-2 text-center text-sm text-slate-500">
        <p>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary-container hover:underline">
            Sign in
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