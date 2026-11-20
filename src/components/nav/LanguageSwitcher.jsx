import { useState } from "react";
import { Check, Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { LANGUAGES } from "@/lib/languages";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/fx/Menu";
import LanguageTip from "@/components/nav/LanguageTip";

/**
 * 🌐 + code trigger, glass dropdown with flags; items stagger in (master prompt 6.4).
 * Keyboard: arrows, Home/End, type-ahead, Escape. The first-visit tip anchors here.
 */
export default function LanguageSwitcher({ showTip = true }) {
  const { t, lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const [used, setUsed] = useState(false);

  return (
    <Menu onOpenChange={setOpen}>
      <MenuTrigger
        aria-label={t("a11y.language")}
        className="group flex h-11 items-center gap-1.5 rounded-full border border-mv-line px-3 font-mono text-xs font-medium uppercase tracking-[0.08em] text-mv-text transition-colors hover:border-mv-line-strong hover:bg-mv-surface-2/60 data-[state=open]:border-mv-violet-400/50"
      >
        <Globe size={16} strokeWidth={1.5} className="text-mv-violet-300 transition-transform duration-500 ease-mv-out group-hover:rotate-[20deg]" />
        {lang}
      </MenuTrigger>
      <MenuContent aria-label={t("a11y.language")} data-lenis-prevent className="max-h-[min(70vh,420px)] min-w-[220px] overflow-y-auto">
        {LANGUAGES.map((l, i) => (
          <MenuItem
            key={l.code}
            index={i}
            lang={l.code}
            checked={lang === l.code}
            onSelect={() => {
              setUsed(true);
              setLang(l.code);
            }}
            className="aria-checked:text-mv-violet-200"
          >
            <span className="text-base leading-none" aria-hidden="true">{l.flag}</span>
            <span className="flex-1">{l.label}</span>
            <span className="font-mono text-[11px] uppercase text-mv-muted" aria-hidden="true">{l.code}</span>
            <Check size={15} strokeWidth={1.75} className={lang === l.code ? "text-mv-violet-300" : "invisible"} aria-hidden="true" />
          </MenuItem>
        ))}
      </MenuContent>
      {showTip && <LanguageTip suppressed={open || used} />}
    </Menu>
  );
}
