import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CenteredLayout from "@/layouts/CenteredLayout";
import Icon from "@/components/common/Icon";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { forgotSchema } from "@/features/auth/authSchemas";

export default function ForgotPassword() {
  const [sentTo, setSentTo] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(forgotSchema), mode: "onTouched" });

  const onSubmit = async ({ email }) => {
    // TODO: POST /auth/forgot-password
    await new Promise((r) => setTimeout(r, 600));
    setSentTo(email);
  };

  return (
    <CenteredLayout>
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-surface-container text-primary-container">
          <Icon name={sentTo ? "mark_email_read" : "lock_reset"} className="text-3xl" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {sentTo ? "Check your inbox" : "Forgot your password?"}
        </h1>
        <p className="mt-2 text-slate-500">
          {sentTo
            ? `If an account exists for ${sentTo}, we sent a link to reset your password.`
            : "Enter your email and we'll send you a link to reset it."}
        </p>
      </div>

      {!sentTo && (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          <Input label="Email" icon="mail" type="email" placeholder="you@company.com" {...register("email")} error={errors.email?.message} />
          <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
            Send reset link
          </Button>
          <p className="text-center text-xs text-slate-500">The link expires after 15 minutes.</p>
        </form>
      )}

      <div className="mt-6 text-center">
        <Link to="/login" className="inline-flex items-center gap-1 text-sm font-medium text-primary-container hover:underline">
          <Icon name="arrow_back" className="text-base" /> Back to login
        </Link>
      </div>
    </CenteredLayout>
  );
}