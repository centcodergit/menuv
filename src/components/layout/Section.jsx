import { forwardRef, useImperativeHandle, useRef } from "react";
import { cn } from "@/lib/utils";
import { useBackgroundIntensity } from "@/hooks/useBackgroundIntensity";

/**
 * Shell for every homepage section: semantic <section>, anchor id, vertical rhythm,
 * and the living-background level while it is on screen ("bright" | "base" | "dim").
 */
const Section = forwardRef(function Section({ id, bg = "base", className, children, ...props }, ref) {
  const local = useRef(null);
  useImperativeHandle(ref, () => local.current);
  useBackgroundIntensity(local, bg);
  return (
    <section ref={local} id={id} data-bg={bg} className={cn("section", className)} {...props}>
      {children}
    </section>
  );
});

export default Section;
