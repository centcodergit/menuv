import { useEffect, useLayoutEffect, useRef, useState } from "react";
import NumberFlow from "@number-flow/react";
import { useI18n } from "@/lib/i18n";
import { gsap, Flip } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { PHONE_LOGO, PHONE_MENU, PHONE_STATUS_TIME, PHONE_TABS } from "@/content/phoneMenu";

/** Natural size of the phone screen in CSS px (3D: mapped onto the phone's screen face; DOM: scaled to fit). */
export const SCREEN_W = 300;
export const SCREEN_H = 640;

/** Labels for <PhoneMenu> from the active dictionary (drei <Html> renders in its own React root, so no context). */
export function usePhoneMenuProps() {
  const { t, locale } = useI18n();
  return {
    locale,
    labels: {
      name: t("phone.name"),
      tagline: t("phone.tagline"),
      recipe: t("phone.recipe"),
      tabs: Object.fromEntries(PHONE_TABS.map((id) => [id, t(`phone.tabs.${id}`)])),
    },
  };
}

function StatusBar() {
  return (
    <div className="relative flex h-11 items-center justify-between px-7 pt-1 text-[12px] font-semibold text-white">
      <span className="tabular-nums">{PHONE_STATUS_TIME}</span>
      <span aria-hidden="true" className="absolute left-1/2 top-2.5 h-[26px] w-[92px] -translate-x-1/2 rounded-full bg-black" />
      <span aria-hidden="true" className="flex items-center gap-1">
        <svg width="16" height="10" viewBox="0 0 16 10" fill="currentColor"><rect x="0" y="6" width="3" height="4" rx="0.8" /><rect x="4.3" y="4" width="3" height="6" rx="0.8" /><rect x="8.6" y="2" width="3" height="8" rx="0.8" /><rect x="12.9" y="0" width="3" height="10" rx="0.8" /></svg>
        <svg width="22" height="11" viewBox="0 0 22 11" fill="none"><rect x="0.5" y="0.5" width="18" height="10" rx="2.6" stroke="currentColor" opacity="0.5" /><rect x="2" y="2" width="13" height="7" rx="1.4" fill="currentColor" /><rect x="19.7" y="3.6" width="1.6" height="3.8" rx="0.8" fill="currentColor" opacity="0.5" /></svg>
      </span>
    </div>
  );
}

/**
 * The La Bella Italia demo menu shown on the hero phone (master prompt 7.1), also used by the mobile fallback
 * and the showcase (7.7). Pure: everything comes in as props, so it works inside drei <Html> too.
 * Tabs: the active-tab pill moves with GSAP Flip, rows re-enter, prices roll with NumberFlow.
 * `autoCycle` advances the tab every 6.5s until the visitor touches it. `flash` briefly brightens the screen
 * (right after the scan passes the QR monolith).
 */
export default function PhoneMenu({ labels, locale, autoCycle = false, flash = false, interactive = true, className, style }) {
  const [tab, setTab] = useState(PHONE_TABS[0]);
  const [touched, setTouched] = useState(false);
  const root = useRef(null);
  const flipState = useRef(null);
  const items = PHONE_MENU[tab];

  useEffect(() => {
    if (!autoCycle || touched) return undefined;
    const id = window.setInterval(() => {
      changeTab(PHONE_TABS[(PHONE_TABS.indexOf(tabRef.current) + 1) % PHONE_TABS.length]);
    }, 6500);
    return () => window.clearInterval(id);
  }, [autoCycle, touched]);

  const tabRef = useRef(tab);
  tabRef.current = tab;

  function changeTab(next) {
    if (next === tabRef.current || !root.current) return;
    flipState.current = Flip.getState(root.current.querySelector("[data-tab-pill]"));
    setTab(next);
  }

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    if (flipState.current) {
      Flip.from(flipState.current, { targets: el.querySelector("[data-tab-pill]"), duration: 0.55, ease: "mv.spring" });
      flipState.current = null;
      gsap.fromTo(el.querySelectorAll("[data-row-text]"), { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.05, ease: "mv.out" });
      gsap.fromTo(el.querySelectorAll("[data-row-emoji]"), { scale: 0.6, rotate: -12 }, { scale: 1, rotate: 0, duration: 0.6, stagger: 0.05, ease: "mv.spring" });
    }
  }, [tab]);

  return (
    <div
      ref={root}
      className={cn("relative select-none overflow-hidden bg-[#0B0A12] font-sans text-white", className)}
      style={{ width: SCREEN_W, height: SCREEN_H, ...style }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(90% 40% at 50% 0%, rgba(124,58,237,0.32), transparent 70%)" }} />
      <StatusBar />

      <div className="relative px-5 pt-5">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">{PHONE_LOGO}</span>
          <div className="min-w-0">
            <p className="font-display text-[19px] font-bold leading-tight tracking-[-0.02em]">{labels.name}</p>
            <p className="truncate text-[12px] text-white/60">{labels.tagline}</p>
          </div>
        </div>

        <div role="tablist" aria-label={labels.name} className="relative mt-5 flex gap-1 rounded-full bg-white/[0.06] p-1">
          {PHONE_TABS.map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              tabIndex={interactive ? (tab === id ? 0 : -1) : -1}
              onClick={() => {
                setTouched(true);
                changeTab(id);
              }}
              className={cn(
                "relative flex-1 rounded-full px-1 py-1.5 text-[11.5px] font-medium transition-colors duration-300",
                tab === id ? "text-white" : "text-white/55",
              )}
            >
              {tab === id && (
                <span
                  data-tab-pill
                  data-flip-id="tab-pill"
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full"
                  style={{ background: "linear-gradient(180deg, #8B5CF6, #6D28D9)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)" }}
                />
              )}
              <span className="relative">{labels.tabs[id]}</span>
            </button>
          ))}
        </div>

        <ul className="mt-5 space-y-2.5" role="tabpanel">
          {items.map((item, slot) => (
            <li key={slot} className="flex items-center gap-3 rounded-2xl bg-white/[0.045] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <span data-row-emoji className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/[0.07] text-[24px]">
                {item.emoji}
              </span>
              <span data-row-text className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-semibold">{item.name}</span>
                <span className="block truncate text-[11.5px] text-white/50">{labels.recipe}</span>
              </span>
              <NumberFlow
                value={item.price}
                locales={locale}
                format={{ style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                className="shrink-0 text-[14px] font-semibold tabular-nums text-[#C4B5FD]"
              />
            </li>
          ))}
        </ul>
      </div>

      <div aria-hidden="true" className="absolute inset-x-0 bottom-2 flex justify-center">
        <span className="h-[5px] w-[112px] rounded-full bg-white/40" />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-white mix-blend-overlay transition-opacity duration-300"
        style={{ opacity: flash ? 0.28 : 0 }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(125deg, rgba(255,255,255,0.08), transparent 32%)" }} />
    </div>
  );
}
