import { USE_MOCK } from "@/api/auth.api";

// One-click logins for visitors. These accounts belong to the sample company "Acme".
export const DEMO_PASSWORD = "password123";
const ACCOUNTS = [
  { label: "Admin", email: "admin@avrit.com" },
  { label: "Recruiter", email: "recruiter@avrit.com" },
  { label: "Hiring manager", email: "manager@avrit.com" },
  { label: "Candidate", email: "candidate@avrit.com" },
];

export default function DemoAccounts({ onPick, disabled }) {
  if (USE_MOCK) return null;
  return (
    <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-surface-container-low p-4">
      <p className="text-sm font-semibold text-on-surface">Just looking around?</p>
      <p className="mt-1 text-xs text-slate-600">Try the sample company with one click:</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {ACCOUNTS.map((a) => (
          <button
            key={a.email}
            type="button"
            disabled={disabled}
            onClick={() => onPick(a.email)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-on-surface hover:bg-slate-50 disabled:opacity-60"
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}