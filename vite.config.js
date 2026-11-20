import base44 from "@base44/vite-plugin";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

/**
 * Preload the Commissioner (display) Greek + Latin woff2 files used above the fold.
 * Fontsource file names are hashed at build time, so we find them in the bundle.
 */
function preloadAboveFoldFonts() {
  return {
    name: "menuverse-preload-fonts",
    apply: "build",
    transformIndexHtml(html, ctx) {
      if (!ctx.bundle) return html;
      const fonts = Object.keys(ctx.bundle).filter((file) =>
        /commissioner-(greek|latin)-wght-normal.*\.woff2$/.test(file),
      );
      return {
        html,
        tags: fonts.map((file) => ({
          tag: "link",
          attrs: { rel: "preload", as: "font", type: "font/woff2", href: `/${file}`, crossorigin: "" },
          injectTo: "head-prepend",
        })),
      };
    },
  };
}

export default defineConfig({
  logLevel: "error",
  plugins: [
    base44({
      legacySDKImports: false,
      hmrNotifier: true,
      navigationNotifier: true,
      visualEditAgent: true,
    }),
    react(),
    preloadAboveFoldFonts(),
  ],
  // Pre-bundle dependencies that are only reached through lazy imports, so the dev server never
  // re-optimizes mid-session (which reloads the page and briefly loads two copies of React).
  optimizeDeps: {
    include: [
      "@radix-ui/react-dialog",
      "gsap/MorphSVGPlugin",
      "gsap/Draggable",
      "gsap/InertiaPlugin",
      "gsap/MotionPathPlugin",
      "@paper-design/shaders-react",
      "canvas-confetti",
      "cobe",
      "sonner",
      "@base44/sdk",
    ],
  },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});
