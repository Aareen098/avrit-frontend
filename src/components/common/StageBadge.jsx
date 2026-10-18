import { STAGES } from "@/utils/candidate";
import { cn } from "@/utils/cn";

export default function StageBadge({ stage }) {
  const s = STAGES[stage];
  return (
    <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-semibold", s?.cls)}>
      {s?.label ?? stage}
    </span>
  );
}