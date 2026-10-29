import { useEffect, useState } from "react";
import api from "@/api/axios";
import { resendVerification } from "@/api/auth.api";
import { useAuthStore } from "@/store/authStore";

// Shown to candidates who signed up with a password and have not clicked the email link yet.
export default function VerifyBanner() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const unverified = user?.emailVerified === false;

  useEffect(() => {
    if (!unverified) return;
    api
      .get("/me")
      .then(({ data }) => {
        if (data.emailVerified) updateUser({ emailVerified: true });
      })
      .catch(() => {});
  }, [unverified, updateUser]);

  if (!unverified) return null;

  const resend = async () => {
    setBusy(true);
    try {
      await resendVerification(user.email);
      setMessage("Sent. Check your inbox and spam folder.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-1 sm:px-2">
        <span>Verify your email to apply for jobs. We sent a link to <b>{user.email}</b>.</span>
        <button type="button" onClick={resend} disabled={busy} className="font-medium underline disabled:opacity-60">
          Resend email
        </button>
        {message && <span>{message}</span>}
      </div>
    </div>
  );
}