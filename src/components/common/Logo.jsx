import { cn } from "@/utils/cn";

// Usage: <Logo />  or  <Logo tag="ATS" />  or  <Logo size="lg" />
export default function Logo({ tag, size = "md", className = "" }) {
  const box = size === "lg" ? "h-12 w-12 text-xl" : "h-9 w-9 text-base";
  const text = size === "lg" ? "text-2xl" : "text-lg";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-lg bg-primary-container font-semibold text-white shadow-card",
          box
        )}
      >
        A
      </div>
      <span className={cn("font-semibold tracking-tight text-on-surface", text)}>
        Avrit
      </span>
      {tag && (
        <span className="rounded bg-surface-container px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
          {tag}
        </span>
      )}
    </div>
  );
}