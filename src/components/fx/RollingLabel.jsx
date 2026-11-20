import { cn } from "@/lib/utils";

/**
 * Hover roll (master prompt 6.4): the label rolls up and a duplicate rises from below (0.35s).
 * Put `group` on the interactive parent. Screen readers read the label once.
 */
export default function RollingLabel({ children, className }) {
  return (
    <span className={cn("relative inline-flex overflow-hidden", className)}>
      <span className="block transition-transform duration-350 ease-mv-out group-hover:-translate-y-full group-focus-visible:-translate-y-full">
        {children}
      </span>
      <span
        aria-hidden="true"
        className="absolute inset-0 block translate-y-full transition-transform duration-350 ease-mv-out group-hover:translate-y-0 group-focus-visible:translate-y-0"
      >
        {children}
      </span>
    </span>
  );
}
