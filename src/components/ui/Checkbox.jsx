import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Checkbox = forwardRef(function Checkbox(
  { label, error, className = "", ...props },
  ref
) {
  return (
    <div>
      <label
        className={cn(
          "flex cursor-pointer items-start gap-2 text-sm text-slate-600",
          className
        )}
      >
        <input
          ref={ref}
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded accent-primary-container"
          {...props}
        />
        <span>{label}</span>
      </label>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});

export default Checkbox;