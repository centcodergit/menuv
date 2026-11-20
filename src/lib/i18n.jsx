import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import el from "@/i18n/el.json";
import { DEFAULT_LANG, LANG_CODES, LANG_STORAGE_KEY, localeFor } from "@/lib/languages";

/*
 * i18n: one key tree shared by all 8 dictionaries in src/i18n/{code}.json.
 * Greek ships in the main bundle (default + fallback). The others load on demand,
 * and main.jsx awaits the visitor's language before the first render (no flash of Greek).
 */
const loaders = import.meta.glob(["../i18n/*.json", "!../i18n/el.json"], { import: "default" });
const cache = { el };

export async function loadDictionary(code) {
  if (cache[code]) return cache[code];
  const loader = loaders[`../i18n/${code}.json`];
  if (!loader) return el;
  cache[code] = await loader();
  return cache[code];
}

const lookup = (dict, key) => key.split(".").reduce((node, part) => (node == null ? undefined : node[part]), dict);

const interpolate = (value, vars) =>
  typeof value === "string" && vars
    ? value.replace(/\{(\w+)\}/g, (match, name) => (vars[name] != null ? String(vars[name]) : match))
    : value;

const I18nContext = createContext(null);

export function I18nProvider({ initialLang = DEFAULT_LANG, children }) {
  const [lang, setLangState] = useState(initialLang);
  const [dict, setDict] = useState(() => cache[initialLang] ?? el);

  const setLang = useCallback(async (code) => {
    if (!LANG_CODES.includes(code)) return;
    const next = await loadDictionary(code);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, code);
    } catch {
      /* storage unavailable */
    }
    setDict(next);
    setLangState(code);
  }, []);

  /**
   * t("hero.title") → string (or array/object for structured keys).
   * Missing keys fall back to Greek, then to the key itself (and warn in development).
   */
  const t = useCallback(
    (key, vars) => {
      let value = lookup(dict, key);
      if (value === undefined) {
        value = lookup(el, key);
        if (import.meta.env.DEV) console.warn(`[i18n] missing "${key}" in ${lang}`);
      }
      if (value === undefined) return key;
      return interpolate(value, vars);
    },
    [dict, lang],
  );

  // <html lang>, title and meta description follow the active language (master prompt 3.2).
  useEffect(() => {
    document.documentElement.lang = lang;
    const title = lookup(dict, "meta.title");
    const description = lookup(dict, "meta.description");
    if (title) document.title = title;
    const set = (selector, value) => value && document.querySelector(selector)?.setAttribute("content", value);
    set('meta[name="description"]', description);
    // Social previews follow too (link unfurlers that run scripts see the visitor's language; crawlers see Greek).
    set('meta[property="og:title"]', title);
    set('meta[name="twitter:title"]', title);
    set('meta[property="og:description"]', description);
    set('meta[name="twitter:description"]', description);
    set('meta[property="og:locale"]', localeFor(lang).replace("-", "_"));
  }, [lang, dict]);

  const value = useMemo(() => ({ lang, locale: localeFor(lang), setLang, t, dict }), [lang, setLang, t, dict]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within an I18nProvider");
  return ctx;
}

/** Shorthand: const t = useT(); */
export const useT = () => useI18n().t;
