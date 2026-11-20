import { cn } from "@/lib/utils";

/** Small accessible switch (role="switch") with a sliding thumb. Used by the footer's reduce-motion toggle. */
export default function ToggleSwitch({ checked, onCheckedChange, disabled, className, ...props }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors duration-300 disabled:opacity-60",
        checked ? "border-mv-violet-400/60 bg-mv-violet-500/70" : "border-mv-line-strong bg-mv-surface-2",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-300 ease-mv-spring",
          checked ? "translate-x-[22px]" : "translate-x-[3px]",
        )}
      />
    </button>
  );
}
