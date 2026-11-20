import { useLayoutEffect, useRef } from "react";
import { Check, Milk, Nut, Wheat } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { gsap, Flip } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { useDemoCycle } from "@/components/features/useDemoCycle";
import { DIET_DISHES, DIET_STEPS, dish } from "@/components/features/demoData";

const CHIPS = [
  { id: "vegan", key: "features.demo.vegan" },
  { id: "glutenFree", key: "features.demo.glutenFree" },
  { id: "allergens", key: "features.demo.allergens" },
];
const ALLERGEN_ICONS = { gluten: Wheat, milk: Milk, nuts: Nut };
const STATIC_STEP = 3;

/**
 * 06 Dietary filters: the chips switch themselves on and off (every 2.6s, a 13s round); matching dishes move
 * to the top and the rest fade back (GSAP Flip), and "allergens" reveals each dish's allergen icons.
 * Once: three changes, then it rests on gluten-free + allergens (also the reduced-motion state).
 */
export default function DietaryDemo({ active, mode }) {
  const { t, locale } = useI18n();
  const list = useRef(null);
  const flip = useRef(null);
  const before = useRef([]);
  const money = new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const step = useDemoCycle({
    active,
    mode,
    count: DIET_STEPS.length,
    interval: 2.6,
    first: 1.2,
    onceSteps: STATIC_STEP,
    staticStep: STATIC_STEP,
    onBeforeStep: () => {
      before.current = DIET_STEPS[stepRef.current];
      const rows = list.current?.querySelectorAll("[data-diet-row]");
      if (rows?.length) flip.current = Flip.getState(rows, { props: "opacity" });
    },
  });

  const stepRef = useRef(step);
  stepRef.current = step;
  const on = DIET_STEPS[step];
  const diets = on.filter((f) => f !== "allergens");
  const showAllergens = on.includes("allergens");
  const matches = (d) => diets.every((f) => d[f]);
  const rows = [...DIET_DISHES].sort((a, b) => Number(matches(b)) - Number(matches(a)));

  useLayoutEffect(() => {
    if (!flip.current) return undefined;
    const tween = Flip.from(flip.current, { duration: 0.7, ease: "mv.inOut", stagger: 0.03 });
    flip.current = null;
    const fresh = DIET_STEPS[step].filter((id) => !before.current.includes(id));
    const chips = fresh.map((id) => list.current?.parentElement.querySelector(`[data-chip="${id}"]`)).filter(Boolean);
    if (chips.length) gsap.fromTo(chips, { scale: 0.9 }, { scale: 1, duration: 0.5, ease: "mv.spring" });
    return () => tween.kill();
  }, [step]);

  return (
    <div className="mx-auto flex h-full w-full max-w-[420px] flex-col justify-center gap-4">
      <div className="flex flex-wrap gap-2">
        {CHIPS.map((chip) => {
          const isOn = on.includes(chip.id);
          return (
            <span
              key={chip.id}
              data-chip={chip.id}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-medium leading-none transition-colors duration-300 ease-mv-out",
                isOn ? "border-mv-violet-400/60 bg-mv-violet-500/15 text-mv-text" : "border-mv-line text-mv-muted",
              )}
            >
              <span className={cn("flex h-3.5 w-3.5 items-center justify-center rounded-full border transition-colors duration-300", isOn ? "border-transparent bg-mv-violet-500 text-white" : "border-mv-line-strong")}>
                <Check size={9} strokeWidth={3} className={cn("transition-opacity duration-300", isOn ? "opacity-100" : "opacity-0")} />
              </span>
              {t(chip.key)}
            </span>
          );
        })}
      </div>

      <ul ref={list} className="space-y-1.5">
        {rows.map((d) => {
          const item = dish(d.id);
          const dim = diets.length > 0 && !matches(d);
          return (
            <li
              key={d.id}
              data-diet-row
              data-flip-id={d.id}
              className="flex items-center gap-3 rounded-xl border border-mv-line bg-mv-surface-2/70 px-2.5 py-1.5"
              style={{ opacity: dim ? 0.32 : 1 }}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-mv-text/[0.06] text-[14px]">{item.emoji}</span>
              <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-mv-text">{item.name}</span>
              <span className={cn("flex items-center gap-1 text-mv-violet-300 transition-opacity duration-500", showAllergens ? "opacity-100" : "opacity-0")}>
                {d.allergens.map((a) => {
                  const Icon = ALLERGEN_ICONS[a];
                  return <Icon key={a} size={13} strokeWidth={1.75} />;
                })}
              </span>
              <span className="w-12 shrink-0 text-right text-[12px] font-semibold tabular-nums text-mv-muted">{money.format(item.price)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
