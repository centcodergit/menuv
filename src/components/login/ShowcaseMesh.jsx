import { useEffect, useRef, useState } from "react";
import { MeshGradient } from "@paper-design/shaders-react";

/** Deeper violet than the site background (8.1). Fixed: the login panel is a dark brand surface in both themes. */
const COLORS = ["#07020F", "#2E1065", "#6D28D9", "#4C1D95"];

/**
 * The /login panel's Paper Shaders MeshGradient (one WebGL context, desktop with motion only).
 * Freezes while the tab is hidden or the panel is off screen.
 */
export default function ShowcaseMesh() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(() => document.visibilityState === "visible");
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const onChange = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onChange);
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    if (ref.current) io.observe(ref.current);
    return () => {
      document.removeEventListener("visibilitychange", onChange);
      io.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className="absolute inset-0 animate-in fade-in duration-1000">
      <MeshGradient
        className="h-full w-full"
        colors={COLORS}
        distortion={0.9}
        swirl={0.45}
        grainMixer={0}
        grainOverlay={0.1}
        speed={visible && inView ? 0.18 : 0}
        minPixelRatio={1}
        maxPixelCount={1280 * 1280}
      />
    </div>
  );
}
