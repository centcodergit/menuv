import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n";
import { useIntroDone } from "@/lib/intro";
import { useExperienceSettled } from "@/lib/experience";
import { LANG_TIP_STORAGE_KEY } from "@/lib/languages";

const seen = () => {
  try {
    return localStorage.getItem(LANG_TIP_STORAGE_KEY) === "1";
  } catch {
    return true;
  }
};

/**
 * First-visit glass popover pointing at the 🌐 switcher (master prompt 3.2).
 * Appears shortly after the intro, once ever (localStorage menuverse-lang-tip). Escape or OK dismisses;
 * using the switcher dismisses it too.
 */
export default function LanguageTip({ suppressed }) {
  const t = useT();
  const introDone = useIntroDone();
  // Waits for the first-visit experience chooser, so two prompts never stack.
  const settled = useExperienceSettled();
  const [visible, setVisible] = useState(false);
  const ok = useRef(null);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(LANG_TIP_STORAGE_KEY, "1");
    } catch {
      /* storage unavailable */
    }
  };

  useEffect(() => {
    if (!introDone || !settled || seen()) return undefined;
    const id = window.setTimeout(() => setVisible(true), 1400);
    return () => window.clearTimeout(id);
  }, [introDone, settled]);

  useEffect(() => {
    if (suppressed && visible) dismiss();
  }, [suppressed, visible]);

  useEffect(() => {
    if (!visible) return undefined;
    const onKey = (e) => e.key === "Escape" && dismiss();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="mv-lang-tip-title"
      className="glass absolute right-0 top-full z-chat mt-3 w-[min(17rem,calc(100vw-2rem))] rounded-inner p-4 text-left animate-in fade-in slide-in-from-top-2 zoom-in-[0.97] duration-500"
    >
      <span
        aria-hidden="true"
        className="absolute -top-[7px] right-6 h-3 w-3 rotate-45 border-l border-t border-mv-line"
        style={{ background: "var(--mv-glass-bg)" }}
      />
      <p id="mv-lang-tip-title" className="font-display text-base font-semibold text-mv-text">
        {t("langTip.title")}
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-mv-muted">{t("langTip.body")}</p>
      <div className="mt-3 flex justify-end">
        <button ref={ok} type="button" onClick={dismiss} className="btn-primary !min-h-[36px] !px-5 !py-1.5 text-sm">
          {t("langTip.ok")}
        </button>
      </div>
    </div>
  );
}
