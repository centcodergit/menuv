import { Beer, Check, CupSoda, Wine } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { formatPrice } from "@/lib/pricing";
import { cn } from "@/lib/utils";

const TOKENS = [
  { Icon: Beer, pos: "left-[4%] top-[14%]", line: "M70 62 C 150 90, 190 120, 236 150", delay: "0s" },
  { Icon: Wine, pos: "left-[1%] top-[48%]", line: "M58 214 C 140 210, 190 190, 236 172", delay: "-2.4s" },
  { Icon: CupSoda, pos: "left-[10%] bottom-[8%]", line: "M98 330 C 160 290, 200 230, 240 196", delay: "-4.8s" },
];

/** The visual: three partner-category tokens linked to a menu whose drink row is a partner feature, and a "€0" seal. */
function PartnersVisual({ t, locale }) {
  const partners = t("guide.c.partners");
  return (
    <div aria-hidden="true" className="relative h-[340px] w-full overflow-hidden rounded-[22px] bg-[radial-gradient(70%_80%_at_70%_40%,rgb(var(--mv-violet-600)/0.28),transparent_70%)] sm:h-[360px]">
      {/* links from each category to the menu */}
      <svg viewBox="0 0 520 360" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        {TOKENS.map((tok) => (
          <path key={tok.line} d={tok.line} fill="none" stroke="rgb(var(--mv-violet-400) / 0.45)" strokeWidth="1.5" strokeDasharray="3 6" className="partners-flow" />
        ))}
      </svg>

      {/* partner categories */}
      {TOKENS.map(({ Icon, pos, delay }, i) => (
        <div key={i} className={cn("partners-float absolute flex items-center gap-2.5", pos)} style={{ animationDelay: delay }}>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-mv-line-strong bg-mv-surface/90 text-mv-violet-300 shadow-[0_12px_30px_-14px_rgba(76,29,149,0.8)]">
            <Icon size={20} strokeWidth={1.6} />
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.12em] text-mv-muted sm:block">{Array.isArray(partners) ? partners[i] : ""}</span>
        </div>
      ))}

      {/* the menu */}
      <div className="absolute right-[5%] top-1/2 w-[min(62%,300px)] -translate-y-1/2 rounded-[22px] border border-mv-line-strong bg-[#0E0B16] p-3.5 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.9)]">
        <div className="mb-3 flex items-center gap-2 px-1">
          <span className="h-6 w-6 rounded-lg bg-gradient-to-br from-mv-violet-400 to-mv-violet-600" />
          <span className="h-2 w-20 rounded-full bg-white/15" />
        </div>
        {[
          ["🍕", "Margherita", 12],
          ["🍝", "Carbonara", 13],
        ].map(([emoji, name, price]) => (
          <div key={name} className="mb-2 flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/[0.03] px-2.5 py-2">
            <span className="text-base">{emoji}</span>
            <span className="flex-1 text-[13px] font-medium text-white/90">{name}</span>
            <span className="text-[12px] font-semibold text-[#C4B5FD]">{formatPrice(price, "EUR", locale)}</span>
          </div>
        ))}
        {/* the partner feature */}
        <div className="relative overflow-hidden rounded-xl border border-mv-violet-400/50 bg-gradient-to-r from-mv-violet-600/30 via-mv-violet-500/15 to-transparent px-2.5 pb-2 pt-1.5 shadow-[0_0_30px_-8px_rgba(139,92,246,0.7)]">
          <span className="partners-sheen pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[#C4B5FD]">{t("guide.c.sponsored")}</span>
          <div className="mt-1 flex items-center gap-2.5">
            <span className="text-base">🍺</span>
            <span className="flex-1 text-[13px] font-semibold text-white">{t("guide.c.drink")}</span>
            <span className="text-[12px] font-semibold text-[#EDE9FE]">{formatPrice(4.5, "EUR", locale)}</span>
          </div>
        </div>
      </div>

      {/* €0 seal */}
      <div className="absolute right-[3%] top-[6%] flex h-[76px] w-[76px] rotate-[8deg] flex-col items-center justify-center rounded-full border border-mv-success/40 bg-mv-surface/90 shadow-[0_14px_34px_-14px_rgba(16,185,129,0.6)]">
        <span className="font-display text-xl font-bold leading-none text-mv-text">{formatPrice(0, "EUR", locale)}</span>
        <span className="mt-1 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-mv-success">{t("guide.c.free")}</span>
      </div>
    </div>
  );
}

/**
 * Coming soon, third card (Nikolas's addition, 20 Nov 2026): planned partnerships with breweries, spirits and soft-drink
 * companies that make the digital menu free for restaurants, in exchange for discreet drink features in the menu.
 * Presented as a plan ("In planning"), no partner names. CSS/SVG only (the section's WebGL budget is taken).
 */
export default function PartnersCard() {
  const { t, locale } = useI18n();
  const points = t("guide.c.points");
  return (
    <article data-guide-card aria-labelledby="guide-c-title" className="stone group relative grid overflow-hidden rounded-card p-2.5 sm:p-3 lg:grid-cols-2 lg:items-center">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-40 opacity-0 transition-opacity duration-500 ease-mv-out group-hover:opacity-100"
        style={{ background: "radial-gradient(60% 100% at 50% 0%, rgb(var(--mv-violet-500) / 0.16), transparent 70%)" }}
      />
      <div className="relative order-2 px-3 pb-4 pt-6 sm:px-5 sm:pb-6 lg:order-1 lg:px-8 lg:py-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-mv-violet-400/40 bg-mv-violet-500/10 px-3 py-1 font-mono text-label font-medium uppercase text-mv-violet-300">
          <span className="h-1.5 w-1.5 rounded-full bg-mv-violet-300" aria-hidden="true" />
          {t("guide.c.label")}
        </span>
        <h3 id="guide-c-title" className="mt-4 max-w-[22ch] font-display text-h3 font-semibold text-mv-text">
          {t("guide.c.title")}
        </h3>
        <p className="mt-3 max-w-[52ch] text-body text-mv-muted md:text-body-lg">{t("guide.c.body")}</p>
        <ul className="mt-6 space-y-2.5">
          {(Array.isArray(points) ? points : []).map((point) => (
            <li key={point} className="flex items-center gap-3 text-sm text-mv-text md:text-base">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mv-violet-500/15 text-mv-violet-300">
                <Check size={14} strokeWidth={2.25} aria-hidden="true" />
              </span>
              {point}
            </li>
          ))}
        </ul>
      </div>
      <div className="relative order-1 lg:order-2">
        <PartnersVisual t={t} locale={locale} />
      </div>
    </article>
  );
}
