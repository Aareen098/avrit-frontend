import { cn } from "@/utils/cn";
import logo from "@/assets/avritlogo.png";

export default function Logo({ tag, size = "md", className = "" }) {
  const box = size === "lg" ? "h-8 w-8" : "h-6 w-6";
  const text = size === "lg" ? "text-2xl" : "text-lg";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <img
        src={logo}
        alt="Avrit logo"
        className={cn("block object-contain rounded-sm shrink-0", box)}
      />

      <span
        className={cn("font-semibold tracking-tight text-on-surface", text)}
      >
        Avrit
      </span>

      {tag && (
        <span className="rounded-md bg-[#E8EDFF] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#172D78]">
          {tag}
        </span>
      )}
    </div>
  );
}
