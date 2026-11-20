import { forwardRef } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Magic UI "Interactive Hover Button", re-themed: on hover a violet fill sweeps out from the dot and the
 * label slides away, replaced by the same label with an arrow. Keyboard focus shows the same state.
 */
const InteractiveHoverButton = forwardRef(function InteractiveHoverButton({ children, className, ...props }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "group relative inline-flex min-h-[52px] items-center overflow-hidden rounded-full border border-mv-line-strong bg-mv-surface/70 px-7 text-[15px] font-medium text-mv-text",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className="absolute left-6 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-mv-violet-500 transition-transform duration-700 ease-mv-out group-hover:scale-[60] group-focus-visible:scale-[60]"
      />
      <span className="relative flex items-center gap-3 pl-5 transition-[transform,opacity] duration-500 ease-mv-out group-hover:translate-x-12 group-hover:opacity-0 group-focus-visible:translate-x-12 group-focus-visible:opacity-0">
        {children}
      </span>
      <span
        aria-hidden="true"
        className="absolute inset-0 flex -translate-x-10 items-center justify-center gap-2 text-white opacity-0 transition-[transform,opacity] duration-500 ease-mv-out group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
      >
        {children}
        <ArrowRight size={18} strokeWidth={1.75} />
      </span>
    </button>
  );
});

export default InteractiveHoverButton;
