import { Link, useNavigate } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CenteredLayout from "@/layouts/CenteredLayout";
import Icon from "@/components/common/Icon";
import Button from "@/components/ui/Button";
import PasswordInput from "@/components/ui/PasswordInput";
import PasswordStrength from "@/features/auth/PasswordStrength";
import { resetSchema } from "@/features/auth/authSchemas";

export default function ResetPassword() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(resetSchema), mode: "onTouched" });

  const passwordValue = useWatch({ control, name: "password" });

  const onSubmit = async () => {
    // TODO: POST /auth/reset-password with the token from the email link (?token=...)
    await new Promise((r) => setTimeout(r, 600));
    navigate("/login");
  };

  return (
    <CenteredLayout>
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-surface-container text-primary-container">
          <Icon name="key" className="text-3xl" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Set a new password</h1>
        <p className="mt-2 text-slate-500">Choose a strong password you don't use anywhere else.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <div>
          <PasswordInput label="New password" placeholder="At least 8 characters" {...register("password")} error={errors.password?.message} />
          <PasswordStrength value={passwordValue} />
        </div>
        <PasswordInput label="Confirm new password" placeholder="Repeat your password" {...register("confirmPassword")} error={errors.confirmPassword?.message} />
        <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
          Reset password
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