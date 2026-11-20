import { forwardRef, lazy, Suspense, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import DragHint from "@/components/guide/DragHint";
import { DishStandIn } from "@/components/guide/StandIns";

// three.js / R3F arrive only when the dish is about to go live (shared lazy chunk with the hero scene).
const DishScene = lazy(() => import("@/components/three/dish/DishScene"));

/**
 * Card B's stage: the 3D dish. `live` mounts the R3F canvas; otherwise the last snapshot (or an SVG stand-in
 * before the first render) shows. The canvas pauses (frameloop "never") while off screen.
 * Signature moment: when the stage reaches the middle of the screen, the layers lift apart, hold, and settle
 * (once per entry, never under reduced motion; waits for the scene if it is still loading).
 */
const DishStage = forwardRef(function DishStage({ live, still, hint, compact }, ref) {
  const stage = useRef(null);
  useImperativeHandle(ref, () => stage.current);
  const explode = useRef({ t: 0, plays: 0 });
  const [poster, setPoster] = useState(null);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hintGone, setHintGone] = useState(false);
  const readyRef = useRef(false);
  const pending = useRef(false);
  const playRef = useRef(() => {});

  useEffect(() => {
    if (!live) {
      setReady(false);
      readyRef.current = false;
    }
  }, [live]);

  useEffect(() => {
    const el = stage.current;
    el.__mvDish = explode.current; // QA / debugging (read-only)
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      if (still) return undefined;
      let armed = true;
      let tl = null;
      const play = () => {
        if (!armed) return;
        if (!readyRef.current) {
          pending.current = true;
          return;
        }
        armed = false;
        pending.current = false;
        explode.current.plays += 1;
        tl?.kill();
        tl = gsap
          .timeline()
          .to(explode.current, { t: 1, duration: 1.25, ease: "mv.out" })
          .to(explode.current, { t: 0, duration: 1.15, ease: "mv.inOut" }, "+=1.1");
      };
      playRef.current = play;
      ScrollTrigger.create({
        trigger: stage.current,
        start: "center 64%",
        end: "center 36%",
        onEnter: play,
        onEnterBack: play,
        onLeave: () => (pending.current = false),
        onLeaveBack: () => (pending.current = false),
      });
      // Re-arm once the stage has left the screen.
      ScrollTrigger.create({
        trigger: stage.current,
        start: "top bottom",
        end: "bottom top",
        onLeave: () => (armed = true),
        onLeaveBack: () => (armed = true),
      });
      return () => {
        tl?.kill();
        explode.current.t = 0;
        playRef.current = () => {};
      };
    },
    { scope: stage, dependencies: [still] },
  );

  const onReady = useCallback(() => {
    readyRef.current = true;
    setReady(true);
    if (pending.current) playRef.current();
  }, []);
  const onDragStart = useCallback(() => setHintGone(true), []);

  return (
    <div
      ref={stage}
      data-guide-stage="dish"
      className="relative aspect-square overflow-hidden rounded-inner sm:aspect-[5/4]"
      style={{
        background:
          "radial-gradient(55% 50% at 50% 42%, rgb(var(--mv-champagne) / 0.13), transparent 70%)," +
          "radial-gradient(80% 70% at 50% 0%, rgb(var(--mv-violet-600) / 0.16), transparent 72%), rgb(var(--mv-ink))",
      }}
    >
      {/* Spotlight cone from above. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[18%] top-0 h-[70%]"
        style={{ background: "linear-gradient(to bottom, rgb(var(--mv-text) / 0.06), transparent)", clipPath: "polygon(38% 0, 62% 0, 100% 100%, 0 100%)" }}
      />
      <DishStandIn className="transition-opacity duration-700 ease-mv-out" style={{ opacity: ready || poster ? 0 : 1 }} />
      {poster && (
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          draggable="false"
          className="absolute inset-0 h-full w-full transition-opacity duration-700 ease-mv-out"
          style={{ opacity: ready ? 0 : 1 }}
        />
      )}
      {live && (
        <div className="absolute inset-0 transition-opacity duration-700 ease-mv-out" style={{ opacity: ready ? 1 : 0 }}>
          <Suspense fallback={null}>
            <DishScene
              paused={!visible}
              autoRotate={!still}
              explode={explode}
              onDragStart={onDragStart}
              onReady={onReady}
              onSnapshot={setPoster}
              maxDpr={compact ? 1.5 : 1.75}
            />
          </Suspense>
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-4">
        <DragHint label={hint} gone={hintGone} still={still} />
      </div>
    </div>
  );
});

export default DishStage;
