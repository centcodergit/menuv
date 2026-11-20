import { cn } from "@/lib/utils";

/**
 * Step marker on the journey path / timeline beam: a zero-size anchor (its position is the path point) with a
 * hairline ring and a violet glow (`[data-marker-glow]`) that lights up when the path or beam reaches it.
 */
export default function Marker({ lit = false, className, style }) {
  return (
    <span data-marker aria-hidden="true" className={cn("pointer-events-none absolute h-0 w-0", className)} style={style}>
      <span className="absolute -left-2.5 -top-2.5 block h-5 w-5 rounded-full border border-mv-line-strong bg-mv-void" />
      <span
        data-marker-glow
        className="absolute -left-2.5 -top-2.5 block h-5 w-5 rounded-full"
        style={{
          opacity: lit ? 1 : 0,
          background: "radial-gradient(circle, rgb(var(--mv-violet-200)) 0 24%, rgb(var(--mv-violet-500)) 42%, rgb(var(--mv-violet-600) / 0) 72%)",
          boxShadow: "0 0 22px 4px rgb(var(--mv-violet-500) / 0.45)",
        }}
      />
    </span>
  );
}
