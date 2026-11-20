import { useEffect, useRef, useState } from "react";

/**
 * Mount heavy things (WebGL canvases) only near the viewport, unmount when far away.
 * Returns [ref, mounted].
 */
export function useInViewMount(rootMargin = "75% 0px") {
  const ref = useRef(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([entry]) => setMounted(entry.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);
  return [ref, mounted];
}

export default useInViewMount;
