import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import CenteredLayout from "@/layouts/CenteredLayout";
import Icon from "@/components/common/Icon";
import Button from "@/components/ui/Button";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const email = params.get("email") || "your email address";
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const resend = () => {
    // TODO: call the resend-verification API
    setSeconds(30);
  };

  return (
    <CenteredLayout>
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-surface-container text-primary-container">
          <Icon name="mark_email_unread" className="text-3xl" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
        <p className="mt-2 text-slate-500">We sent a verification link to</p>
        <p className="mt-1 break-all font-medium text-on-surface">{email}</p>

        <div className="mt-6 rounded-lg bg-surface-container-low p-4 text-sm text-slate-600">
          The email can take up to 2 minutes. Check your spam folder too. The link expires in 24 hours.
        </div>

        <Button variant="secondary" size="lg" fullWidth className="mt-6" disabled={seconds > 0} onClick={resend}>
          {seconds > 0 ? `Resend email in 0:${String(seconds).padStart(2, "0")}` : "Resend email"}
        </Button>

        <Link to="/login" className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary-container hover:underline">
          <Icon name="arrow_back" className="text-base" /> Back to login
        </Link>
      </div>
    </CenteredLayout>
  );
}