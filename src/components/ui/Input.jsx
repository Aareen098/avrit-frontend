import { forwardRef, useId } from "react";
import { cn } from "@/utils/cn";
import Icon from "@/components/common/Icon";

// Works with react-hook-form: <Input label="Email" {...register("email")} error={errors.email?.message} />
const Input = forwardRef(function Input(
  { label, icon, error, hint, rightSlot, className = "", id, ...props },
  ref
) {
  const autoId = useId();
  const inputId = id || autoId;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-on-surface">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <Icon
            name={icon}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? "true" : undefined}
          className={cn(
            "h-11 w-full rounded-lg border bg-white px-3 text-sm text-on-surface placeholder:text-slate-400",
            "border-slate-200 focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/15",
            icon && "pl-10",
            rightSlot && "pr-11",
            error && "border-red-400 focus:border-red-500 focus:ring-red-200",
            className
          )}
          {...props}
        />
        {rightSlot && (
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2">{rightSlot}</div>
        )}
      </div>
      {error ? (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
});

export default Input;