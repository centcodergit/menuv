/** Site languages in menu order (master prompt 3.2). Greek is the default. */
export const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧", locale: "en-GB" },
  { code: "el", label: "Ελληνικά", flag: "🇬🇷", locale: "el-GR" },
  { code: "de", label: "Deutsch", flag: "🇩🇪", locale: "de-DE" },
  { code: "fr", label: "Français", flag: "🇫🇷", locale: "fr-FR" },
  { code: "es", label: "Español", flag: "🇪🇸", locale: "es-ES" },
  { code: "it", label: "Italiano", flag: "🇮🇹", locale: "it-IT" },
  { code: "pt", label: "Português", flag: "🇵🇹", locale: "pt-PT" },
  { code: "nl", label: "Nederlands", flag: "🇳🇱", locale: "nl-NL" },
];

export const DEFAULT_LANG = "el";
export const LANG_CODES = LANGUAGES.map((l) => l.code);
export const LANG_STORAGE_KEY = "menuverse-lang";
export const LANG_TIP_STORAGE_KEY = "menuverse-lang-tip";

export const localeFor = (code) => LANGUAGES.find((l) => l.code === code)?.locale ?? "el-GR";

/** Stored choice, else a match on navigator.language, else Greek. */
export function detectLanguage() {
  try {
    const stored = localStorage.getItem(LANG_STORAGE_KEY);
    if (LANG_CODES.includes(stored)) return stored;
  } catch {
    /* storage unavailable */
  }
  const nav = (typeof navigator !== "undefined" ? navigator.language || "" : "").slice(0, 2).toLowerCase();
  return LANG_CODES.includes(nav) ? nav : DEFAULT_LANG;
}
