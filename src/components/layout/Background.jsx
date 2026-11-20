import { lazy, Suspense, useEffect, useState } from "react";
import { useTheme } from "@/providers/ThemeProvider";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsDesktop } from "@/hooks/useIsTouch";
import { BG_LAYER_ID, currentIntensity } from "@/hooks/useBackgroundIntensity";

const MeshGradientLayer = lazy(() => import("@/components/layout/MeshGradientLayer"));

const supportsWebGL = () => {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
};

/** Static fallback that approximates the mesh gradient with layered radial glows (no WebGL). */
function CssGradient() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(70% 55% at 75% 10%, rgb(var(--mv-violet-600) / 0.32), transparent 70%)," +
          "radial-gradient(60% 50% at 10% 60%, rgb(var(--mv-plum-800) / 0.75), transparent 70%)," +
          "radial-gradient(50% 40% at 85% 85%, rgb(var(--mv-violet-500) / 0.16), transparent 70%)," +
          "rgb(var(--mv-void))",
      }}
    />
  );
}

/**
 * The living background (master prompt 6.2): one fixed layer behind the whole site.
 * Desktop: Paper Shaders MeshGradient, mounted after first paint (idle) so it never delays the LCP.
 * Touch devices, reduced motion and no-WebGL: a static CSS gradient. This also keeps mobile within
 * its budget of one live WebGL context (saved for the sections that need it).
 * Brightness is this layer's opacity, which sections set through useBackgroundIntensity().
 */
export default function Background() {
  const { theme } = useTheme();
  const reduced = useReducedMotion();
  const isDesktop = useIsDesktop();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isDesktop || !supportsWebGL()) return undefined;
    const idle = window.requestIdleCallback ?? ((cb) => window.setTimeout(cb, 300));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const id = idle(() => setReady(true), { timeout: 1500 });
    return () => cancel(id);
  }, [isDesktop]);

  const useShader = isDesktop && ready;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-bg overflow-hidden">
      <div
        id={BG_LAYER_ID}
        className="absolute inset-0 transition-opacity ease-mv-out will-change-[opacity]"
        style={{ opacity: currentIntensity(), transitionDuration: "800ms" }}
      >
        <CssGradient />
        {useShader && (
          <Suspense fallback={null}>
            <MeshGradientLayer theme={theme} still={reduced} />
          </Suspense>
        )}
      </div>
      <div className="absolute inset-0" style={{ background: "var(--mv-vignette)" }} />
    </div>
  );
}
