import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

/** Magic UI Scroll Progress: a 2px violet hairline at the very top, above the navbar. */
export default function ScrollProgress() {
  const bar = useRef(null);

  useGSAP(() => {
    const setScale = gsap.quickSetter(bar.current, "scaleX");
    setScale(0);
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => setScale(self.progress),
    });
  });

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-progress h-[2px]">
      <div
        ref={bar}
        className="h-full origin-left"
        style={{
          transform: "scaleX(0)",
          background: "linear-gradient(90deg, #6D28D9, #8B5CF6 40%, #C4B5FD 75%, #E879F9)",
        }}
      />
    </div>
  );
}
