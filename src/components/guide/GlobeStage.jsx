import { forwardRef, useEffect, useState } from "react";
import Globe from "@/components/fx/Globe";
import MetalEmblem from "@/components/fx/MetalEmblem";
import { GlobeStandIn } from "@/components/guide/StandIns";

/** Food capitals (master prompt 7.11). Decorative: the card text carries the meaning. */
const CITIES = [
  { id: "athens", location: [37.9838, 23.7275], size: 0.05 },
  { id: "paris", location: [48.8566, 2.3522], size: 0.04 },
  { id: "tokyo", location: [35.6762, 139.6503], size: 0.045 },
  { id: "new-york", location: [40.7128, -74.006], size: 0.045 },
  { id: "copenhagen", location: [55.6761, 12.5683], size: 0.035 },
  { id: "lima", location: [-12.0464, -77.0428], size: 0.04 },
  { id: "san-sebastian", location: [43.3183, -1.9812], size: 0.032 },
  { id: "mexico-city", location: [19.4326, -99.1332], size: 0.04 },
];
// Start facing Europe (Athens in front), tilted to show the northern hemisphere.
const START_PHI = 4.35;

/**
 * Card A's stage: the night globe with the champagne emblem floating in front.
 * `live` mounts the WebGL globe; otherwise the last snapshot (or a CSS stand-in before the first render) shows.
 */
const GlobeStage = forwardRef(function GlobeStage({ live, still, dragLabel }, ref) {
  const [poster, setPoster] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!live) setReady(false);
  }, [live]);

  return (
    <div
      ref={ref}
      data-guide-stage="globe"
      data-cursor="drag"
      data-cursor-label={dragLabel}
      className="relative aspect-square overflow-hidden rounded-inner sm:aspect-[5/4]"
      style={{
        background:
          "radial-gradient(70% 60% at 50% 30%, rgb(var(--mv-violet-600) / 0.2), transparent 72%), rgb(var(--mv-ink))",
      }}
    >
      {/* Globe box: wider than tall stages crop its lower half, faded out by the mask. */}
      <div
        className="absolute left-1/2 top-[3%] w-[104%] -translate-x-1/2 sm:w-[86%]"
        style={{
          maskImage: "linear-gradient(to bottom, black 62%, transparent 92%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 62%, transparent 92%)",
        }}
      >
        <div className="relative aspect-square">
          <GlobeStandIn className="transition-opacity duration-700 ease-mv-out" style={{ opacity: ready || poster ? 0 : 1 }} />
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
            <Globe
              data-guide-globe
              markers={CITIES}
              phi={START_PHI}
              theta={0.32}
              still={still}
              onReady={() => setReady(true)}
              onSnapshot={setPoster}
              className="absolute inset-0 transition-opacity duration-700 ease-mv-out"
              style={{ opacity: ready ? 1 : 0, touchAction: "pan-y", cursor: "inherit" }}
            />
          )}
        </div>
      </div>

      {/* The emblem floats in front of the globe. */}
      <div className="pointer-events-none absolute bottom-[9%] left-1/2 w-[24%] max-w-[150px] -translate-x-1/2 sm:w-[20%]">
        <div style={still ? undefined : { animation: "mv-guide-float 8s ease-in-out infinite" }}>
          <div
            aria-hidden="true"
            className="absolute -inset-[35%] rounded-full opacity-70 blur-2xl"
            style={{ background: "radial-gradient(closest-side, rgb(var(--mv-champagne) / 0.4), transparent)" }}
          />
          <MetalEmblem still={still} className="relative block w-full drop-shadow-[0_14px_18px_rgba(0,0,0,0.55)]" />
        </div>
      </div>
    </div>
  );
});

export default GlobeStage;
