import { cn } from "@/utils/cn";

// Usage: <Icon name="search" /> (any name from fonts.google.com/icons)
export default function Icon({ name, filled = false, className = "" }) {
  return (
    <span
      aria-hidden="true"
      className={cn("material-symbols-outlined select-none", className)}
      style={filled ? { fontVariationSettings: '"FILL" 1' } : undefined}
    >
      {name}
    </span>
  );
}