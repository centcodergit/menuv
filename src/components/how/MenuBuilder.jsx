import { useRef, useState } from "react";
import NumberFlow from "@number-flow/react";
import { GripVertical, Minus, Plus } from "lucide-react";
import { gsap, Flip } from "@/lib/gsap";
import { useI18n } from "@/lib/i18n";
import { PHONE_LOGO, PHONE_MENU } from "@/content/phoneMenu";
import { useArtLoop } from "@/components/how/useArtLoop";

const DISHES = PHONE_MENU.pizza;
const EDITED = 0; // the dish whose price is being set (Margherita)
const STEP = 0.5;
const START = DISHES[EDITED].price - 3 * STEP; // rolls up to the real price
const MOVED = [2, 0, 1]; // Diavola dragged to the top
const FORMAT = { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 };

/**
 * Step 3 illustration: a menu-builder panel. Dish rows (La Bella Italia's pizzas) drop in, one is dragged to
 * the top and the list reorders (GSAP Flip on CSS `order`), then the price field steps up with NumberFlow.
 * Entrance once, then an 8.4s loop that puts the order and the price back at its end.
 */
export default function MenuBuilder({ active, still }) {
  const { t, locale } = useI18n();
  const root = useRef(null);
  const [price, setPrice] = useState(still ? DISHES[EDITED].price : START);

  useArtLoop(root, {
    active,
    still,
    final: () => setPrice(DISHES[EDITED].price),
    build: (tl) => {
      const rows = () => gsap.utils.toArray("[data-row]", root.current);
      const reorder = (order) => {
        const list = rows();
        const state = Flip.getState(list);
        list.forEach((row, i) => {
          row.style.order = String(order.indexOf(i));
        });
        Flip.from(state, { duration: 0.75, ease: "mv.inOut" });
      };

      setPrice(START);
      gsap.set("[data-row]", { y: -26, rotation: -2, autoAlpha: 0 });
      gsap.set("[data-price-field]", { y: 14, autoAlpha: 0 });
      gsap.set("[data-sel]", { autoAlpha: 0 });
      tl.to("[data-row]", { y: 0, rotation: 0, autoAlpha: 1, duration: 0.75, ease: "mv.spring", stagger: 0.13 }, 0.15).to(
        "[data-price-field]",
        { y: 0, autoAlpha: 1, duration: 0.7, ease: "mv.out" },
        0.55,
      );

      const lifted = `[data-row="${MOVED[0]}"] [data-row-card]`;
      const loop = gsap.timeline({ repeat: -1 });
      loop
        .to(lifted, { scale: 1.035, y: -3, duration: 0.3, ease: "mv.out" }, 0.4)
        .to(`[data-row="${MOVED[0]}"] [data-lift]`, { autoAlpha: 1, duration: 0.3 }, 0.4)
        .call(() => reorder(MOVED), null, 0.8)
        .to(lifted, { scale: 1, y: 0, duration: 0.35, ease: "mv.out" }, 1.65)
        .to(`[data-row="${MOVED[0]}"] [data-lift]`, { autoAlpha: 0, duration: 0.35 }, 1.65)
        .to("[data-sel]", { autoAlpha: 1, duration: 0.3 }, 2.1);
      [1, 2, 3].forEach((k) => {
        const at = 2.0 + k * 0.8;
        loop
          .call(() => setPrice(START + k * STEP), null, at)
          .to("[data-plus]", { scale: 0.84, duration: 0.12, ease: "power2.out", yoyo: true, repeat: 1 }, at - 0.12);
      });
      loop
        .to("[data-sel]", { autoAlpha: 0, duration: 0.3 }, 5.8)
        .call(() => reorder([0, 1, 2]), null, 6.2)
        .call(() => setPrice(START), null, 7.4)
        .set({}, {}, 8.4);
      tl.add(loop, 1.2);

      return () => {
        rows().forEach((row) => row.style.removeProperty("order"));
      };
    },
  });

  return (
    <div ref={root} className="relative h-full w-full">
      <div className="absolute inset-0" style={{ background: "radial-gradient(50% 50% at 50% 55%, rgb(var(--mv-violet-600) / 0.2), transparent 72%)" }} />
      <div
        className="absolute left-1/2 top-1/2 w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-card border border-mv-line p-6"
        style={{ background: "rgb(var(--mv-surface) / 0.94)", boxShadow: "var(--mv-glass-highlight), 0 40px 90px -40px rgba(76, 29, 149, 0.7)" }}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mv-surface-2 text-xl">{PHONE_LOGO}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-[17px] font-bold tracking-[-0.02em] text-mv-text">{t("phone.name")}</p>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-mv-violet-300">{t("phone.tabs.pizza")}</p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-mv-line text-mv-muted">
            <Plus size={16} strokeWidth={1.75} />
          </span>
        </div>

        <div className="mt-5 flex flex-col gap-2.5">
          {DISHES.map((dish, i) => (
            <div key={dish.id} data-row={i} className="relative">
              <div data-row-card className="relative flex items-center gap-3 rounded-inner border border-mv-line bg-mv-surface-2 px-3 py-2.5">
                <span data-lift className="absolute -inset-px rounded-inner opacity-0 shadow-[0_18px_36px_-14px_rgba(76,29,149,0.85)] ring-1 ring-mv-violet-400/50" />
                {i === EDITED && <span data-sel className="absolute -inset-px rounded-inner border border-mv-violet-400/80 opacity-0" />}
                <GripVertical size={16} strokeWidth={1.5} className="relative shrink-0 text-mv-muted/70" />
                <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mv-surface text-[20px]">{dish.emoji}</span>
                <span className="relative min-w-0 flex-1 truncate text-[15px] font-semibold text-mv-text">{dish.name}</span>
                <NumberFlow
                  value={i === EDITED ? price : dish.price}
                  locales={locale}
                  format={FORMAT}
                  className="relative shrink-0 text-[14.5px] font-semibold tabular-nums text-mv-violet-300"
                />
              </div>
            </div>
          ))}
        </div>

        <div data-price-field className="mt-5">
          <p className="text-[12.5px] font-medium text-mv-muted">
            {t("how.demo.price")} · {DISHES[EDITED].name}
          </p>
          <div className="mt-2 flex h-12 items-center justify-between rounded-input border border-mv-violet-400/50 bg-mv-surface-2 pl-4 pr-1.5 shadow-[0_0_0_4px_rgb(var(--mv-violet-500)/0.1)]">
            <NumberFlow value={price} locales={locale} format={FORMAT} className="text-[16px] font-semibold tabular-nums text-mv-text" />
            <span className="flex items-center gap-1">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-mv-surface text-mv-muted">
                <Minus size={15} strokeWidth={1.75} />
              </span>
              <span
                data-plus
                className="flex h-9 w-9 items-center justify-center rounded-full text-white"
                style={{ background: "linear-gradient(180deg, #8B5CF6, #6D28D9)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)" }}
              >
                <Plus size={15} strokeWidth={2} />
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
