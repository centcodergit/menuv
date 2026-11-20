import { useT } from "@/lib/i18n";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsDesktop } from "@/hooks/useIsTouch";
import CurvedLoop from "@/components/fx/CurvedLoop";

// "Menu" in all eight site languages. Identical in every language on purpose (it is multilingual by design).
const WORDS = "ΜΕΝΟΥ ✦ MENU ✦ SPEISEKARTE ✦ CARTE ✦ CARTA ✦ MENÙ ✦ EMENTA ✦ MENUKAART ✦ ";

/**
 * 7.3 Divider, the multilingual loop: the word "menu" in all eight languages on a gentle, draggable arc
 * (React Bits Curved Loop) in Commissioner 800 with the text gradient; speed follows scroll velocity.
 * Touch / small screens: a straight marquee. Reduced motion: still. Decorative (aria-hidden).
 */
export default function MultilingualLoop() {
  const t = useT();
  const reduced = useReducedMotion();
  const isDesktop = useIsDesktop();

  return (
    <div className="relative overflow-hidden py-[clamp(2rem,6vh,4.5rem)]" aria-hidden="true">
      {isDesktop ? (
        <CurvedLoop text={WORDS} still={reduced} dragLabel={t("cursor.drag")} className="-mx-[4vw]" />
      ) : (
        <div className="flex overflow-hidden [--gap:0px]">
          {[0, 1].map((copy) => (
            <span
              key={copy}
              className="text-gradient shrink-0 whitespace-nowrap pr-4 font-display text-[clamp(2.6rem,12vw,4.5rem)] font-extrabold tracking-[-0.03em] motion-safe:animate-marquee"
              style={{ "--duration": "36s" }}
            >
              {WORDS}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
