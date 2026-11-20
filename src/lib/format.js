import { localeFor } from "@/lib/languages";

/** Numbers in the active locale (el-GR, en-GB, de-DE, …). */
export function formatNumber(value, lang, options) {
  return new Intl.NumberFormat(localeFor(lang), options).format(value);
}

/** Money in the active locale. JPY has no decimals. */
export function formatCurrency(value, currency, lang, options = {}) {
  const digits = currency === "JPY" ? 0 : 2;
  return new Intl.NumberFormat(localeFor(lang), {
    style: "currency",
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    ...options,
  }).format(value);
}
