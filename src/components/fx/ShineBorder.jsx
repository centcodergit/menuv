import { cn } from "@/lib/utils";

/**
 * Magic UI "Shine Border", re-themed: a slow violet light travelling around a 1px border.
 * Pure CSS (masked radial gradient). One loop takes 14s (nothing loops faster than 6s).
 */
export default function ShineBorder({ className, width = 1, duration = 14, colors = ["#8B5CF6", "#C4B5FD", "#E879F9"] }) {
  return (
    <span
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 rounded-[inherit] motion-safe:animate-shine", className)}
      style={{
        "--duration": `${duration}s`,
        padding: width,
        backgroundImage: `radial-gradient(transparent, transparent, ${colors.join(", ")}, transparent, transparent)`,
        backgroundSize: "300% 300%",
        WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
        WebkitMaskComposite: "xor",
        mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
      }}
    />
  );
}
