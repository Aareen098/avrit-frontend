import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CenteredLayout from "@/layouts/CenteredLayout";
import Icon from "@/components/common/Icon";
import Button from "@/components/ui/Button";
import PasswordInput from "@/components/ui/PasswordInput";
import PasswordStrength from "@/features/auth/PasswordStrength";
import { resetSchema } from "@/features/auth/authSchemas";
import { resetPassword } from "@/api/auth.api";

// Opened from the link in an email: /reset-password?token=...  (invite emails add &invite=1)
export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const invite = params.get("invite") === "1";
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(resetSchema), mode: "onTouched" });

  const passwordValue = useWatch({ control, name: "password" });

  const onSubmit = async ({ password }) => {
    setError("");
    try {
      await resetPassword({ token, password });
      setDone(true);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!token) {
    return (
      <CenteredLayout>
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">This link is not complete</h1>
          <p className="mt-2 text-slate-500">Open the link from your email again, or ask for a new one.</p>
          <Link to="/forgot-password" className="mt-5 inline-block text-sm font-medium text-primary-container hover:underline">Get a new link</Link>
        </div>
      </CenteredLayout>
    );
  }

  if (done) {
    return (
      <CenteredLayout>
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-surface-container text-primary-container">
            <Icon name="check_circle" className="text-3xl" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{invite ? "You are all set" : "Password changed"}</h1>
          <p className="mt-2 text-slate-500">You can now log in with your new password.</p>
          <Link to="/login"><Button size="lg" fullWidth className="mt-6">Go to login</Button></Link>
        </div>
      </CenteredLayout>
    );
  }

  return (
    <CenteredLayout>
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-surface-container text-primary-container">
          <Icon name="key" className="text-3xl" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{invite ? "Welcome! Set your password" : "Set a new password"}</h1>
        <p className="mt-2 text-slate-500">Choose a strong password you don't use anywhere else.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <div>
          <PasswordInput label="New password" placeholder="At least 8 characters" {...register("password")} error={errors.password?.message} />
          <PasswordStrength value={passwordValue} />
        </div>
        <PasswordInput label="Confirm new password" placeholder="Repeat your password" {...register("confirmPassword")} error={errors.confirmPassword?.message} />
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error} <Link to="/forgot-password" className="font-medium underline">Get a new link</Link>
          </p>
        )}
        <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
          {invite ? "Set password" : "Reset password"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link to="/login" className="inline-flex items-center gap-1 text-sm font-medium text-primary-container hover:underline">
          <Icon name="arrow_back" className="text-base" /> Back to login
        </Link>
      </div>
    </CenteredLayout>
  );
}