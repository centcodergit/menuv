import { useEffect, useRef } from "react";
import NumberFlow from "@number-flow/react";
import { ArrowRight, Sparkles } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { currencyFormat } from "@/lib/pricing";
import BorderBeam from "@/components/fx/BorderBeam";
import DottedGlow from "@/components/fx/DottedGlow";
import GlowingEffect from "@/components/fx/GlowingEffect";
import Magnet from "@/components/fx/Magnet";

const TILT = 3; // degrees at the card's edge (readability first)
const CHECK = "M5 10.4l3.1 3.1L15 6.6";

/**
 * A dictionary string with one {token}, rendered with a React node in its place (keeps word order per language).
 * The node stays on one line with the text glued to it ("12 €/μήνα" never breaks after the slash).
 */
function Fill({ template, token, children }) {
  const [before, after = ""] = String(template).split(`{${token}}`);
  const glued = after.match(/^\S*/)[0];
  return (
    <>
      {before}
      <span className="whitespace-nowrap">
        {children}
        {glued}
      </span>
      {after.slice(glued.length)}
    </>
  );
}

/** Every price is a NumberFlow: digits roll when the period or currency changes (snaps with reduced motion). */
function Money({ value, currency, locale, reduced, className }) {
  return <NumberFlow value={value} locales={locale} format={currencyFormat(currency, value)} animated={!reduced} className={className} />;
}

/**
 * One plan (master prompt 7.8): stone card, Glowing Effect border (fine pointer), subtle tilt (≤3°, fine pointer,
 * motion allowed), checkmarks that draw in (Pricing's entrance timeline, `[data-check]`), and a struck-through
 * regular price whose line draws left to right (`[data-strike]`).
 * Professional is raised with a top glow, a continuous Border Beam and the "Πιο Δημοφιλές" glass pill;
 * Enterprise is a darker card with a faint animated dot grid and its price in serif italic.
 */
export default function PlanCard({ id, price, billing, currency, locale, t, reduced, fine, featured = false, cta }) {
  const host = useRef(null);
  const card = useRef(null);
  const enterprise = !price;
  const tilt = fine && !reduced;
  const name = t(`pricing.plans.${id}.name`);
  const features = t(`pricing.plans.${id}.features`);
  const titleId = `plan-${id}-title`;

  useEffect(() => {
    if (!tilt) return undefined;
    const el = card.current;
    const area = host.current;
    const rx = gsap.quickTo(el, "rotationX", { duration: 0.7, ease: "power3.out" });
    const ry = gsap.quickTo(el, "rotationY", { duration: 0.7, ease: "power3.out" });
    const move = (e) => {
      const r = area.getBoundingClientRect();
      rx(-((e.clientY - r.top) / r.height - 0.5) * TILT * 2);
      ry(((e.clientX - r.left) / r.width - 0.5) * TILT * 2);
    };
    const leave = () => {
      rx(0);
      ry(0);
    };
    area.addEventListener("pointermove", move);
    area.addEventListener("pointerleave", leave);
    return () => {
      area.removeEventListener("pointermove", move);
      area.removeEventListener("pointerleave", leave);
      gsap.killTweensOf(el);
      gsap.set(el, { clearProps: "transform" });
    };
  }, [tilt]);

  const yearly = billing === "yearly";
  const ctaClass = cn(featured ? "btn-primary" : "btn-outline", "group/cta w-full whitespace-nowrap px-4");

  return (
    <div className={cn("relative h-full", featured && "xl:scale-[1.04]")}>
      {featured && (
        <p className="glass absolute left-1/2 top-0 z-[2] inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-mv-violet-200">
          <Sparkles size={13} strokeWidth={1.5} aria-hidden="true" className="text-mv-violet-300" />
          {t("pricing.popular")}
        </p>
      )}
      <div ref={host} className="h-full [perspective:1200px]">
        <article
          ref={card}
          data-plan-card={id}
          aria-labelledby={titleId}
          className={cn(
            "stone group relative flex h-full flex-col rounded-card p-7 lg:p-8",
            enterprise && "bg-mv-ink",
            // Raised shadow from tablet up (the phone carousel would clip it at the track's edge).
            featured && "border-mv-violet-400/30 md:[box-shadow:0_30px_80px_-36px_rgb(var(--mv-violet-600)/0.55)]",
          )}
        >
          {/* Stone: a soft violet light at the top edge on hover. Professional keeps an inner glow at the top. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: "radial-gradient(80% 45% at 50% 0%, rgb(var(--mv-violet-500) / 0.12), transparent 70%)" }}
          />
          {featured && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[inherit]"
              style={{ background: "radial-gradient(75% 38% at 50% 0%, rgb(var(--mv-violet-500) / 0.24), rgb(var(--mv-violet-500) / 0.06) 55%, transparent 80%)" }}
            />
          )}
          {enterprise && <DottedGlow reduced={reduced} />}
          {featured && !reduced && <BorderBeam size={150} duration={9} radius={28} width={1.5} />}
          <GlowingEffect disabled={!fine} reduced={reduced} />

          <div className="relative flex flex-1 flex-col">
            {/* [data-eq] blocks are lined up per row by Pricing (useEqualRows), so the CTAs align in every language. */}
            <div data-eq="head">
              <div>
                <h3 id={titleId} className="font-display text-h3 font-semibold text-mv-text">
                  {name}
                </h3>
                <p className="mt-1.5 text-sm text-mv-muted">{t(`pricing.plans.${id}.tagline`)}</p>
              </div>
            </div>

            <div data-eq="price" className="mt-6">
              <div>
                {enterprise ? (
                  <p className="font-serif-italic leading-none">
                    <span className="text-gradient block pb-1 pr-2 text-[clamp(2.25rem,2.8vw,2.75rem)] leading-[1.05]">{t("pricing.plans.enterprise.priceTop")}</span>
                    <span className="mt-2 block text-xl text-mv-muted">{t("pricing.plans.enterprise.priceBottom")}</span>
                  </p>
                ) : (
                  <>
                    <p className="flex flex-wrap items-end gap-x-3 gap-y-1">
                      <span data-price-now className="font-display text-[clamp(2.75rem,3.6vw,3.5rem)] font-bold leading-[0.95] tracking-[-0.04em] text-mv-text">
                        <Money value={price.now} currency={currency} locale={locale} reduced={reduced} />
                      </span>
                      <span data-price-regular className="relative mb-1 inline-flex text-lg font-medium text-mv-muted">
                        <span className="sr-only">{t("pricing.regularPrice")}</span>
                        <Money value={price.regular} currency={currency} locale={locale} reduced={reduced} />
                        <span data-strike aria-hidden="true" className="pointer-events-none absolute -inset-x-1 top-1/2 h-[1.5px] origin-left rounded-full bg-mv-violet-400/90" />
                      </span>
                    </p>
                    <p data-price-then className="mt-3 text-sm leading-snug text-mv-muted">
                      <Fill template={t("pricing.firstMonth")} token="price">
                        <Money value={price.perMonth} currency={currency} locale={locale} reduced={reduced} className="font-semibold text-mv-text" />
                      </Fill>
                    </p>
                    <p
                      data-price-yearly
                      aria-hidden={!yearly}
                      className={cn("mt-2 font-mono text-[11px] uppercase tracking-[0.1em] text-mv-muted transition-opacity duration-500", yearly ? "opacity-100" : "opacity-0")}
                    >
                      <Fill template={t("pricing.billedYearly")} token="total">
                        <Money value={price.yearlyTotal} currency={currency} locale={locale} reduced={reduced} className="text-mv-text" />
                      </Fill>
                    </p>
                  </>
                )}
              </div>
            </div>

            <Magnet className="mt-6 block w-full" innerClassName="w-full" strength={0.12} padding={36}>
              {cta({ className: ctaClass, describedBy: titleId, arrow: <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" className="transition-transform duration-300 ease-mv-out group-hover/cta:translate-x-0.5" /> })}
            </Magnet>

            <ul role="list" className="mt-7 space-y-3 border-t border-mv-line pt-6 text-[15px] leading-snug text-mv-text/90">
              {(Array.isArray(features) ? features : []).map((feature, i) => (
                <li key={i} className="flex gap-3">
                  <span aria-hidden="true" className="mt-px grid h-5 w-5 shrink-0 place-items-center rounded-full bg-mv-violet-500/15 text-mv-violet-300">
                    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path data-check d={CHECK} />
                    </svg>
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>
      </div>
    </div>
  );
}
