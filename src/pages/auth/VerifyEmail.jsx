import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import CenteredLayout from "@/layouts/CenteredLayout";
import Icon from "@/components/common/Icon";
import Button from "@/components/ui/Button";
import { resendVerification, verifyEmail } from "@/api/auth.api";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const email = params.get("email") || "";
  const [status, setStatus] = useState(token ? "checking" : "idle"); // checking | ok | error | idle
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    if (!token) return;
    verifyEmail(token)
      .then(() => setStatus("ok"))
      .catch((err) => {
        setError(err.message);
        setStatus("error");
      });
  }, [token]);

  useEffect(() => {
    if (token || seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds, token]);

  const resend = async () => {
    if (email) await resendVerification(email).catch(() => {});
    setSeconds(30);
  };

  if (token) {
    return (
      <CenteredLayout>
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-surface-container text-primary-container">
            <Icon name={status === "ok" ? "check_circle" : status === "error" ? "error" : "hourglass_top"} className="text-3xl" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {status === "ok" ? "Email verified" : status === "error" ? "Link not valid" : "Verifying..."}
          </h1>
          {status === "ok" && <p className="mt-2 text-slate-500">Thank you. You can now apply for jobs.</p>}
          {status === "error" && <p className="mt-2 text-slate-500">{error} Log in and use "Resend" in the yellow bar.</p>}
          {status !== "checking" && (
            <Link to="/"><Button size="lg" fullWidth className="mt-6">Continue</Button></Link>
          )}
        </div>
      </CenteredLayout>
    );
  }

  return (
    <CenteredLayout>
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-surface-container text-primary-container">
          <Icon name="mark_email_unread" className="text-3xl" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
        <p className="mt-2 text-slate-500">We sent a verification link to</p>
        <p className="mt-1 break-all font-medium text-on-surface">{email || "your email address"}</p>

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