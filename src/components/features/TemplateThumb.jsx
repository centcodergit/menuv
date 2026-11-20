import { PHONE_LOGO, PHONE_MENU } from "@/content/phoneMenu";
import { cn } from "@/lib/utils";

/**
 * A menu-template thumbnail for the Card Swap demo: the La Bella Italia menu in one of four type and colour
 * treatments. Demo art, so its palettes are fixed hex values (they are "other restaurants' brands").
 */
const TREATMENTS = {
  nocturne: {
    tab: "pizza",
    shell: "bg-[#0B0A12] text-white",
    glow: "radial-gradient(90% 45% at 50% 0%, rgba(124,58,237,0.45), transparent 70%)",
  },
  trattoria: { tab: "pasta", shell: "bg-[#F4ECDD] text-[#3B2416]" },
  verde: { tab: "starters", shell: "bg-[#0F2A22] text-[#EFE6CF]" },
  riviera: { tab: "desserts", shell: "bg-[#F5F8FC] text-[#14315C]" },
};

const SHOWN_TABS = ["starters", "pizza", "pasta"];

export default function TemplateThumb({ variant, labels, locale }) {
  const v = TREATMENTS[variant];
  const items = PHONE_MENU[v.tab];
  const money = new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div
      className={cn("relative h-[252px] w-[192px] overflow-hidden rounded-[18px] p-3.5 shadow-[0_24px_50px_-20px_rgba(0,0,0,0.75)] ring-1 ring-black/10", v.shell)}
      style={v.glow ? { backgroundImage: v.glow } : undefined}
    >
      {variant === "nocturne" && (
        <>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-[14px]">{PHONE_LOGO}</span>
            <span className="truncate font-display text-[13px] font-bold tracking-[-0.02em]">{labels.name}</span>
          </div>
          <div className="mt-3 flex gap-1 rounded-full bg-white/[0.07] p-[3px]">
            {SHOWN_TABS.map((id) => (
              <span
                key={id}
                className={cn("min-w-0 flex-1 truncate rounded-full px-1 py-[3px] text-center text-[8.5px] font-medium", id === v.tab ? "text-white" : "text-white/55")}
                style={id === v.tab ? { background: "linear-gradient(180deg, #8B5CF6, #6D28D9)" } : undefined}
              >
                {labels.tabs[id]}
              </span>
            ))}
          </div>
          <ul className="mt-3 space-y-1.5">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-2 rounded-[10px] bg-white/[0.05] p-1.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.08] text-[13px]">{item.emoji}</span>
                <span className="min-w-0 flex-1 truncate text-[10px] font-semibold">{item.name}</span>
                <span className="text-[9.5px] font-semibold tabular-nums text-[#C4B5FD]">{money.format(item.price)}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {variant === "trattoria" && (
        <>
          <p className="text-center font-serif-italic text-[19px] leading-tight text-[#7A2E1F]">{labels.name}</p>
          <div className="mx-auto mt-2 flex w-3/4 items-center gap-1.5">
            <span className="h-px flex-1 bg-[#7A2E1F]/40" />
            <span className="text-[8px] text-[#7A2E1F]">✦</span>
            <span className="h-px flex-1 bg-[#7A2E1F]/40" />
          </div>
          <p className="mt-3 text-center font-mono text-[8px] uppercase tracking-[0.2em] text-[#7A2E1F]">{labels.tabs[v.tab]}</p>
          <ul className="mt-3 space-y-2.5">
            {items.map((item) => (
              <li key={item.id} className="flex items-baseline gap-1 text-[10.5px]">
                <span className="font-serif-italic">{item.name}</span>
                <span className="mx-1 flex-1 border-b border-dotted border-[#3B2416]/40" />
                <span className="font-serif-italic tabular-nums">{money.format(item.price)}</span>
              </li>
            ))}
          </ul>
          <p className="absolute inset-x-0 bottom-3 text-center text-[16px] opacity-80">{PHONE_LOGO}</p>
        </>
      )}

      {variant === "verde" && (
        <>
          <p className="truncate font-mono text-[7.5px] uppercase tracking-[0.2em] text-[#D9B26A]">{labels.tagline}</p>
          <p className="mt-1 font-display text-[15px] font-extrabold uppercase leading-none tracking-[0.04em]">{labels.name}</p>
          <div className="mt-3 flex gap-3 border-b border-[#D9B26A]/25">
            {SHOWN_TABS.map((id) => (
              <span key={id} className={cn("min-w-0 truncate pb-1 text-[8.5px] font-medium", id === v.tab ? "border-b border-[#D9B26A] text-[#D9B26A]" : "text-[#EFE6CF]/55")}>
                {labels.tabs[id]}
              </span>
            ))}
          </div>
          <ul className="mt-2">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-2 border-b border-[#EFE6CF]/10 py-2 last:border-0">
                <span className="text-[13px]">{item.emoji}</span>
                <span className="min-w-0 flex-1 truncate text-[10px] font-medium">{item.name}</span>
                <span className="font-mono text-[9px] tabular-nums text-[#D9B26A]">{money.format(item.price)}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {variant === "riviera" && (
        <>
          <div className="-mx-3.5 -mt-3.5 flex h-[74px] items-end justify-between px-3.5 pb-2.5" style={{ background: "linear-gradient(160deg, #9CC9F5 0%, #2F6FDB 100%)" }}>
            <span className="font-display text-[14px] font-bold leading-tight text-white drop-shadow-sm">{labels.name}</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[13px] shadow">{PHONE_LOGO}</span>
          </div>
          <p className="mt-2.5 text-[11px] font-semibold">{labels.tabs[v.tab]}</p>
          <ul className="mt-1.5 space-y-1.5">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-2 rounded-[10px] bg-white p-1.5 shadow-[0_2px_8px_-3px_rgba(20,49,92,0.25)]">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#EAF2FC] text-[12px]">{item.emoji}</span>
                <span className="min-w-0 flex-1 truncate text-[10px] font-medium">{item.name}</span>
                <span className="rounded-full bg-[#2F6FDB] px-1.5 py-[2px] text-[8.5px] font-semibold tabular-nums text-white">{money.format(item.price)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export const TEMPLATE_VARIANTS = Object.keys(TREATMENTS);
