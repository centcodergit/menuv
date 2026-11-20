import { useEffect, useState } from "react";

/** True while `ref` intersects the viewport (IntersectionObserver, no scroll reads). Off when `enabled` is false. */
export function useVisible(ref, { threshold = 0, rootMargin = "0px", enabled = true } = {}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) {
      setVisible(false);
      return undefined;
    }
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold, rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold, rootMargin, enabled]);
  return visible;
}

export default useVisible;
