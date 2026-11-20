import { useEffect, useState } from "react";
import { MeshGradient } from "@paper-design/shaders-react";

const PALETTES = {
  dark: ["#050507", "#1E0B3D", "#5B21B6", "#0B0B12"],
  light: ["#FAFAF9", "#EDE9FE", "#C4B5FD", "#FFFFFF"],
};

/**
 * Paper Shaders MeshGradient (master prompt 6.2). Colours swap with the theme as props,
 * so the WebGL context is never re-created. `still` freezes it (reduced motion).
 * Pauses while the tab is hidden.
 */
export default function MeshGradientLayer({ theme, still }) {
  const [visible, setVisible] = useState(() => document.visibilityState === "visible");

  useEffect(() => {
    const onChange = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);

  return (
    <MeshGradient
      className="absolute inset-0 h-full w-full animate-in fade-in duration-1000"
      colors={PALETTES[theme] ?? PALETTES.dark}
      distortion={0.85}
      swirl={0.35}
      grainMixer={0}
      grainOverlay={0.12}
      speed={still || !visible ? 0 : 0.15}
      minPixelRatio={1}
      maxPixelCount={1920 * 1080}
    />
  );
}
