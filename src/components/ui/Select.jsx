import { forwardRef, useId } from "react";
import { cn } from "@/utils/cn";

const Select = forwardRef(function Select(
  { label, options = [], placeholder = "Select...", error, className = "", id, ...props },
  ref
) {
  const autoId = useId();
  const selectId = id || autoId;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-on-surface">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        aria-invalid={error ? "true" : undefined}
        defaultValue=""
        className={cn(
          "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-on-surface",
          "focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/15",
          error && "border-red-400",
          className
        )}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});

export default Select;