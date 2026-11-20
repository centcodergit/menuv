import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import SplitFlap from "@/components/features/SplitFlap";
import { useDemoCycle } from "@/components/features/useDemoCycle";
import { FLAP_WORDS } from "@/components/features/demoData";

const LENGTH = Math.max(...FLAP_WORDS.map((w) => Array.from(w).length));
const DRUM = [...new Set(FLAP_WORDS.join("").split(""))].join("");

/**
 * 04 Multilingual menu: a departures board flips one dish name through its spellings (the tourist metaphor).
 * Loop: a new spelling every 3s (an 18s round). Once: through the list a single time. Reduced motion: the
 * board rests on the Greek name and the list underneath shows every spelling.
 */
export default function LanguagesDemo({ active, mode }) {
  const step = useDemoCycle({ active, mode, count: FLAP_WORDS.length, interval: 3, first: 2.2 });
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    if (active) setBooted(true);
  }, [active]);

  const resting = mode === "static" || booted;
  const word = resting ? FLAP_WORDS[step] : "";

  return (
    <div className="mx-auto flex h-full min-h-[150px] w-full max-w-[460px] flex-col justify-center">
      <div className="rounded-[18px] border border-mv-line p-3 sm:p-4" style={{ background: "linear-gradient(180deg, #0E0D15, #08080D)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 20px 40px -24px rgba(0,0,0,0.8)" }}>
        <div className="mb-3 flex items-center justify-between font-mono text-[10px] font-medium tabular-nums tracking-[0.12em] text-[#A1A1B5]">
          <span className="flex gap-1">
            {FLAP_WORDS.map((w, i) => (
              <span key={w} className={cn("h-1 w-3 rounded-full transition-colors duration-500", resting && i === step ? "bg-[#A78BFA]" : "bg-white/15")} />
            ))}
          </span>
          <span>
            {String((resting ? step : 0) + 1).padStart(2, "0")}/{String(FLAP_WORDS.length).padStart(2, "0")}
          </span>
        </div>
        <SplitFlap text={word} length={LENGTH} animate={mode !== "static"} glyphs={DRUM} />
      </div>
      <p className="mt-3 flex flex-wrap justify-center gap-x-2 gap-y-1 font-mono text-[11px] leading-snug">
        {FLAP_WORDS.map((w, i) => (
          <span key={w} className={cn("transition-colors duration-500", resting && i === step ? "text-mv-violet-300" : "text-mv-muted/70")}>
            {w}
            {i < FLAP_WORDS.length - 1 && <span className="ml-2 text-mv-muted/40">·</span>}
          </span>
        ))}
      </p>
    </div>
  );
}
