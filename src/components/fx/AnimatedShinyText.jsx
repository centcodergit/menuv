import { cn } from "@/lib/utils";

/**
 * Magic UI "Animated Shiny Text", re-themed: the text sits at reduced opacity and a narrow band of light sweeps
 * across it (background clipped to the glyphs, `shiny-text` keyframes in tailwind.config.js, one pass per 8s).
 * The band is the theme's text colour, so it reads as light on Nocturne and as ink on Porcelain.
 * Reduced motion: no sweep (the global reduced-motion rules stop the animation too).
 */
export default function AnimatedShinyText({ as: Tag = "span", children, className, shimmerWidth = 90, style, ...props }) {
  return (
    <Tag
      {...props}
      style={{
        "--shiny-width": `${shimmerWidth}px`,
        backgroundImage: "linear-gradient(90deg, transparent, rgb(var(--mv-text) / 0.9) 50%, transparent)",
        ...style,
      }}
      className={cn(
        "animate-shiny-text bg-clip-text bg-no-repeat text-mv-violet-200/80 motion-reduce:animate-none",
        "[background-position:0_0] [background-size:var(--shiny-width)_100%]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
