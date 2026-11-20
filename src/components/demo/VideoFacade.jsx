import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { useT } from "@/lib/i18n";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const VIDEO_ID = "XoTqAIHZuts";
const THUMB = `https://i.ytimg.com/vi/${VIDEO_ID}/maxresdefault.jpg`;
const THUMB_FALLBACK = `https://i.ytimg.com/vi/${VIDEO_ID}/hqdefault.jpg`;
const EMBED = `https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0&modestbranding=1`;

/**
 * Click-to-play YouTube facade (master prompt 3.11 / 7.6): the thumbnail darkened 30% with a large glass
 * play button; nothing from YouTube loads until the click, then the privacy-enhanced embed autoplays.
 * The hero's "Δείτε το Demo" button sends `mv:demo-pulse`, which pulses the play button.
 */
export default function VideoFacade() {
  const t = useT();
  const reduced = useReducedMotion();
  const [playing, setPlaying] = useState(false);
  const [thumb, setThumb] = useState(THUMB);
  const button = useRef(null);
  const ring = useRef(null);

  useEffect(() => {
    const onPulse = () => {
      if (!button.current || reduced) return;
      gsap
        .timeline()
        .to(button.current, { scale: 1.14, duration: 0.25, ease: "power2.out" })
        .to(button.current, { scale: 1, duration: 0.7, ease: "elastic.out(1, 0.45)" })
        .fromTo(ring.current, { scale: 1, autoAlpha: 0.9 }, { scale: 2.1, autoAlpha: 0, duration: 1.1, ease: "mv.out" }, 0)
        .to(button.current, { scale: 1.1, duration: 0.2, ease: "power2.out" }, 1.1)
        .to(button.current, { scale: 1, duration: 0.6, ease: "elastic.out(1, 0.45)" });
      button.current.focus({ preventScroll: true });
    };
    window.addEventListener("mv:demo-pulse", onPulse);
    return () => window.removeEventListener("mv:demo-pulse", onPulse);
  }, [reduced]);

  if (playing) {
    return (
      <iframe
        src={EMBED}
        title={t("demo.videoTitle")}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`${t("demo.play")}: ${t("demo.videoTitle")}`}
      data-cursor="media"
      data-cursor-label={t("demo.play")}
      className="group absolute inset-0 block focus-visible:outline-offset-[-4px]"
    >
      <img
        src={thumb}
        onError={() => setThumb(THUMB_FALLBACK)}
        alt=""
        width={1280}
        height={720}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-mv-out group-hover:scale-[1.03]"
      />
      <span aria-hidden="true" className="absolute inset-0 bg-black/30" />
      <span aria-hidden="true" className="absolute inset-0" style={{ background: "radial-gradient(60% 60% at 50% 50%, transparent, rgba(5,5,7,0.55))" }} />
      <span className="absolute inset-0 flex items-center justify-center">
        <span ref={button} tabIndex={-1} className="relative flex h-20 w-20 items-center justify-center rounded-full md:h-24 md:w-24">
          <span aria-hidden="true" className="absolute inset-0 rounded-full border border-white/40 motion-safe:animate-pulse-ring" />
          <span ref={ring} aria-hidden="true" className="absolute inset-0 rounded-full border-2 border-mv-violet-300 opacity-0" />
          <span className="glass absolute inset-0 rounded-full !bg-white/15 transition-colors duration-300 group-hover:!bg-white/25" />
          <Play size={30} strokeWidth={1.5} className="relative translate-x-0.5 fill-white text-white" />
        </span>
      </span>
    </button>
  );
}
