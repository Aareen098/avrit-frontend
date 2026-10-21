import { Link } from "react-router-dom";
import Logo from "@/components/common/Logo";
import AuthPanel from "@/features/auth/AuthPanel";

const YEAR = new Date().getFullYear();

// Split screen: form on the left, indigo panel on the right (desktop only).
export default function AuthLayout({ panel, tag, children }) {
  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-12 lg:px-16">
        <Link to="/login" className="w-fit">
          <Logo tag={tag} />
        </Link>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          {children}
        </div>

        <p className="text-center text-xs text-slate-400">
          © {YEAR} Avrit
        </p>
      </div>

      <AuthPanel {...panel} />
    </div>
  );
}