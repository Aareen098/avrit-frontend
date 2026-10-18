import Icon from "@/components/common/Icon";
import { scoreClass } from "@/utils/candidate";
import { cn } from "@/utils/cn";

// Staff only. Shows the AI match score as a pill.
export default function ScoreBadge({ score }) {
  if (score == null) {
    return (
      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
        Not scored
      </span>
    );
  }
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold", scoreClass(score))}>
      {score >= 85 && <Icon name="auto_awesome" filled className="text-sm" />}
      {score}%
    </span>
  );
}