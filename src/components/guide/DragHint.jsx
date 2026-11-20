import { Hand } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * "Σύρε για να εξερευνήσεις" with a hand that swipes left and right once every 6.5s (nothing loops faster
 * than 6s). Fades out for good after the first drag (`gone`). Still under reduced motion.
 * aria-hidden: it explains the decorative, aria-hidden canvas only.
 */
export default function DragHint({ label, gone, still, className }) {
  return (
    <div
      aria-hidden="true"
      data-guide-hint
      className={cn(
        "pointer-events-none flex items-center gap-2.5 rounded-full border border-mv-line bg-mv-surface/85 px-4 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-mv-text shadow-[0_8px_30px_-12px_rgb(0_0_0/0.6)] transition-[opacity,transform] duration-700 ease-mv-out",
        gone ? "translate-y-2 opacity-0" : "opacity-100",
        className,
      )}
    >
      <span className="relative flex h-5 w-5 items-center justify-center text-mv-violet-300">
        <Hand size={18} strokeWidth={1.5} style={still ? undefined : { animation: "mv-guide-swipe 6.5s cubic-bezier(0.76,0,0.24,1) infinite" }} />
      </span>
      {label}
    </div>
  );
}
