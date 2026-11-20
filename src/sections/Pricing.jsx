import { useCallback, useMemo, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/AuthContext";
import { openChat } from "@/lib/chatBus";
import { PAID_PLANS, PLAN_IDS, planPricing } from "@/lib/pricing";
import { useCurrency, useExchangeRates } from "@/hooks/useCurrency";
import { useIsTouch } from "@/hooks/useIsTouch";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { usePageTransition } from "@/providers/PageTransition";
import Section from "@/components/layout/Section";
import SectionHeader from "@/components/layout/SectionHeader";
import BillingToggle from "@/components/pricing/BillingToggle";
import CurrencySelect from "@/components/pricing/CurrencySelect";
import PlanCard from "@/components/pricing/PlanCard";
import PlanTrack from "@/components/pricing/PlanTrack";
import useEqualRows from "@/components/pricing/useEqualRows";

const FEATURED = "professional";
const ENTERPRISE_EMAIL = "menuverse.gr@gmail.com";
const EQUAL_GROUPS = ["head", "price"];

/**
 * 7.8 Pricing, "Πακέτα για Κάθε Ανάγκη" (logic 3.5): billing toggle with the yearly badge, currency selector,
 * four plans. Paid plans show €0 (first month free) next to the struck-through regular price, then the
 * per-month price; yearly adds the yearly total. Every price is a NumberFlow in the selected currency.
 * CTAs: signed out → /login with plan, billing and currency; signed in → the support chat, prefilled.
 * Enterprise → the chat prefilled ("mailto:" when scripts don't run).
 * Entrance: controls rise, cards rise in a stagger, checkmarks draw (DrawSVG, stagger 0.05), then the strike
 * lines draw left to right. Reduced motion: everything is shown in its final state.
 */
export default function Pricing() {
  const { t, locale } = useI18n();
  const reduced = useReducedMotion();
  const touch = useIsTouch();
  const { isAuthenticated } = useAuth();
  const { transitionTo } = usePageTransition();
  const [billing, setBilling] = useState("monthly");
  const [currency, setCurrency] = useCurrency();
  const { rates } = useExchangeRates({ enabled: currency !== "EUR" });
  const root = useRef(null);
  useEqualRows(root, EQUAL_GROUPS, "[data-plan-slide]");

  const prices = useMemo(
    () =>
      Object.fromEntries(
        PAID_PLANS.map((id) => [
          id,
          {
            ...planPricing(id, { billing, currency, rates }),
            // Always known, so the line can fade in with the right figure when yearly is chosen.
            yearlyTotal: planPricing(id, { billing: "yearly", currency, rates }).yearlyTotal,
          },
        ]),
      ),
    [billing, currency, rates],
  );

  const startChat = useCallback(
    (id) => openChat({ message: t("pricing.chatPrefill", { plan: t(`pricing.plans.${id}.name`), billing: t(`pricing.${billing}`), currency }) }),
    [t, billing, currency],
  );

  useGSAP(
    () => {
      if (reduced) return;
      const q = gsap.utils.selector(root);
      const controls = q("[data-pricing-controls]");
      const slides = q("[data-plan-slide]");
      gsap.set(controls, { opacity: 0, y: 16 });
      gsap.set(slides, { opacity: 0, y: 56 });
      gsap.set(q("[data-strike]"), { scaleX: 0 });
      gsap.set(q("[data-check]"), { drawSVG: "0%" });

      ScrollTrigger.create({
        trigger: controls[0],
        start: "top 88%",
        once: true,
        onEnter: () => gsap.to(controls, { opacity: 1, y: 0, duration: 0.7, ease: "mv.out", clearProps: "transform" }),
      });
      ScrollTrigger.create({
        trigger: q("[data-plan-track]")[0],
        start: "top 85%",
        once: true,
        onEnter: () => {
          const tl = gsap.timeline();
          slides.forEach((slide, i) => {
            const at = i * 0.08;
            const checks = slide.querySelectorAll("[data-check]");
            const strike = slide.querySelector("[data-strike]");
            tl.to(slide, { opacity: 1, y: 0, duration: 1, ease: "mv.out", clearProps: "transform" }, at);
            if (checks.length) tl.to(checks, { drawSVG: "100%", duration: 0.4, ease: "power2.out", stagger: 0.05 }, at + 0.45);
            if (strike) tl.to(strike, { scaleX: 1, duration: 0.6, ease: "mv.inOut" }, at + 0.75);
          });
        },
      });
    },
    { scope: root, dependencies: [reduced] },
  );

  // Called as a plain function (not a component), so the CTA element is reconciled, never remounted.
  const ctaFor = (id, { className, describedBy, arrow }) => {
    if (id === "enterprise") {
      return (
        <a
          href={`mailto:${ENTERPRISE_EMAIL}`}
          data-plan-cta={id}
          aria-describedby={describedBy}
          className={className}
          onClick={(e) => {
            e.preventDefault();
            openChat({ message: t("pricing.chatPrefillEnterprise") });
          }}
        >
          {t("pricing.contact")}
          {arrow}
        </a>
      );
    }
    if (isAuthenticated) {
      return (
        <button type="button" data-plan-cta={id} aria-describedby={describedBy} className={className} onClick={() => startChat(id)}>
          {t("pricing.getStarted")}
          {arrow}
        </button>
      );
    }
    const href = `/login?plan=${id}&billing=${billing}&currency=${currency}`;
    return (
      <a
        href={href}
        data-plan-cta={id}
        aria-describedby={describedBy}
        className={className}
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
          e.preventDefault();
          transitionTo(href);
        }}
      >
        {t("pricing.getStarted")}
        {arrow}
      </a>
    );
  };

  return (
    <Section id="pricing" bg="bright" aria-labelledby="pricing-title">
      <div ref={root} className="container-mv">
        <SectionHeader id="pricing" eyebrow={t("pricing.eyebrow")} title={t("pricing.title")} lead={t("pricing.lead")} accentWords={2} titleId="pricing-title" />

        <div data-pricing-controls className="relative z-10 mt-10 flex flex-col items-center gap-4 md:mt-12 lg:flex-row lg:justify-center lg:gap-8">
          <BillingToggle billing={billing} onChange={setBilling} reduced={reduced} t={t} />
          <CurrencySelect currency={currency} onChange={setCurrency} t={t} />
        </div>

        <div className="mt-8 md:mt-14">
          <PlanTrack
            ids={PLAN_IDS}
            featured={FEATURED}
            t={t}
            reduced={reduced}
            renderPlan={(id) => (
              <PlanCard
                id={id}
                price={prices[id] ?? null}
                billing={billing}
                currency={currency}
                locale={locale}
                t={t}
                reduced={reduced}
                fine={!touch}
                featured={id === FEATURED}
                cta={(props) => ctaFor(id, props)}
              />
            )}
          />
        </div>
      </div>
    </Section>
  );
}
