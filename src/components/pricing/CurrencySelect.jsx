import { useId } from "react";
import { Check, ChevronDown } from "lucide-react";
import { CURRENCIES } from "@/lib/pricing";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/fx/Menu";

/**
 * 7.8 currency selector: a glass dropdown with flags and codes (the navbar's accessible menu: arrows, Home/End,
 * type-ahead by code, Escape returns focus). The list scrolls inside itself (`data-lenis-prevent`).
 * The visible "Νόμισμα" label and the current code together name the trigger.
 */
export default function CurrencySelect({ currency, onChange, t }) {
  const id = useId();
  const current = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0];

  return (
    <div className="flex items-center gap-3">
      <span id={`${id}-label`} className="font-mono text-label font-medium uppercase text-mv-muted">
        {t("pricing.currency")}
      </span>
      <Menu>
        <MenuTrigger
          id={`${id}-trigger`}
          aria-labelledby={`${id}-label ${id}-trigger`}
          data-currency-trigger
          className="group flex h-11 items-center gap-2 rounded-full border border-mv-line bg-mv-surface/70 pl-3.5 pr-3 font-mono text-[13px] font-medium text-mv-text transition-colors duration-300 hover:border-mv-line-strong data-[state=open]:border-mv-violet-400/50"
        >
          <span aria-hidden="true" className="text-base leading-none">
            {current.flag}
          </span>
          <span>{current.code}</span>
          <ChevronDown size={16} strokeWidth={1.5} aria-hidden="true" className="text-mv-muted transition-transform duration-300 ease-mv-out group-data-[state=open]:rotate-180" />
        </MenuTrigger>
        <MenuContent aria-labelledby={`${id}-label`} data-lenis-prevent data-currency-menu className="max-h-[min(60vh,340px)] w-[13.5rem] overflow-y-auto overscroll-contain">
          {CURRENCIES.map((c, i) => (
            <MenuItem key={c.code} index={i} checked={c.code === currency} onSelect={() => onChange(c.code)} data-currency={c.code} className="aria-checked:text-mv-violet-200">
              {/* Code first in the DOM so type-ahead matches it; the flag is moved in front visually. */}
              <span className="font-mono text-[13px] font-medium">{c.code}</span>
              <span className="flex-1 text-mv-muted">{c.symbol}</span>
              <span aria-hidden="true" className="order-first text-base leading-none">
                {c.flag}
              </span>
              <Check size={15} strokeWidth={1.75} aria-hidden="true" className={c.code === currency ? "text-mv-violet-300" : "invisible"} />
            </MenuItem>
          ))}
        </MenuContent>
      </Menu>
    </div>
  );
}
