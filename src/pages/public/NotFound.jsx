import { Link } from "react-router-dom";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 text-center">
      <p className="text-6xl font-semibold tracking-tight text-primary-container">404</p>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-2 text-slate-500">The page you are looking for does not exist or was moved.</p>
      <Link to="/" className="mt-6">
        <Button size="lg">Go to home</Button>
      </Link>
    </div>
  );
}
