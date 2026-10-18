import { cn } from "@/utils/cn";

function getScore(p = "") {
  let score = 0;
  if (p.length >= 8) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  if (p.length >= 12 && /[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
  return score;
}

const labels = ["Too short", "Weak", "Fair", "Good", "Strong"];
const colors = ["bg-slate-200", "bg-red-500", "bg-amber-500", "bg-emerald-400", "bg-emerald-600"];

export default function PasswordStrength({ value }) {
  if (!value) return null;
  const score = getScore(value);

  return (
    <div className="mt-2">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn("h-1.5 flex-1 rounded-full", i <= score ? colors[score] : "bg-slate-200")}
          />
        ))}
      </div>
      <p className="mt-1 text-xs text-slate-500">
        {labels[score]} · 8+ characters, 1 number, 1 symbol
      </p>
    </div>
  );
}