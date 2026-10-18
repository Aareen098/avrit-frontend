import { Link } from "react-router-dom";
import Logo from "@/components/common/Logo";

// Small centered card, used for verify email, forgot and reset password.
export default function CenteredLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-10">
      <Link to="/login" className="mb-8">
        <Logo tag="ATS" />
      </Link>
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-card">
        {children}
      </div>
    </div>
  );
}