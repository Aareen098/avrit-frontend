import { cn } from "@/utils/cn";

// Small shared pieces for the candidate AI cards.
export function FitScore({ score }) {
  const tone = score >= 75 ? "bg-emerald-50 text-emerald-700" : score >= 50 ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600";
  return <span className={cn("rounded-full px-3 py-1 text-sm font-semibold", tone)}>{score}% match</span>;
}

export function Chips({ items, tone = "slate" }) {
  if (!items?.length) return null;
  const color = tone === "red" ? "bg-red-50 text-red-700" : tone === "green" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700";
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((s) => (
        <span key={s} className={cn("rounded-full px-3 py-1 text-xs font-semibold", color)}>{s}</span>
      ))}
    </div>
  );
}

export function List({ title, items }) {
  if (!items?.length) return null;
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-600">
        {items.map((s) => <li key={s}>{s}</li>)}
      </ul>
    </div>
  );
}

export const WAIT_TEXT = "The AI is reading your resume. This can take up to a minute...";