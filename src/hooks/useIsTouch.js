import { useMediaQuery } from "@/hooks/useMediaQuery";

/** Touch-first device: no hover or a coarse pointer. Gets the lighter version of every heavy effect. */
export function useIsTouch() {
  return useMediaQuery("(hover: none), (pointer: coarse)");
}

/** Desktop-class device: fine pointer, hover, and at least 1024px wide. Gates WebGL scenes. */
export function useIsDesktop() {
  return useMediaQuery("(hover: hover) and (pointer: fine) and (min-width: 1024px)");
}

export default useIsTouch;
