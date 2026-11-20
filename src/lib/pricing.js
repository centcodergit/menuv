/**
 * Pricing and currency logic (master prompt 3.5). Prices are stored in EUR; other currencies are converted with
 * ECB rates from the `getExchangeRates` backend function (FALLBACK_RATES when it is unreachable).
 */

export const PLAN_IDS = ["starter", "professional", "devoted", "enterprise"];
export const PAID_PLANS = ["starter", "professional", "devoted"];

/**
 * EUR prices. Yearly figures are the old site's published prices (docs/DECISIONS.md), not a computed 20% off:
 * €100 / €180 / €288 per year, advertised as €10 / €15 / €24 per month.
 */
export const PLAN_PRICES = {
  starter: { monthly: 12, yearlyMonthly: 10, yearlyTotal: 100 },
  professional: { monthly: 18, yearlyMonthly: 15, yearlyTotal: 180 },
  devoted: { monthly: 30, yearlyMonthly: 24, yearlyTotal: 288 },
};

/** The 12 selectable currencies, in the spec's order. `symbol` is for the selector; prices use Intl formatting. */
export const CURRENCIES = [
  { code: "EUR", symbol: "€", flag: "🇪🇺" },
  { code: "USD", symbol: "$", flag: "🇺🇸" },
  { code: "GBP", symbol: "£", flag: "🇬🇧" },
  { code: "CHF", symbol: "Fr", flag: "🇨🇭" },
  { code: "CAD", symbol: "C$", flag: "🇨🇦" },
  { code: "AUD", symbol: "A$", flag: "🇦🇺" },
  { code: "JPY", symbol: "¥", flag: "🇯🇵" },
  { code: "DKK", symbol: "kr", flag: "🇩🇰" },
  { code: "SEK", symbol: "kr", flag: "🇸🇪" },
  { code: "NOK", symbol: "kr", flag: "🇳🇴" },
  { code: "PLN", symbol: "zł", flag: "🇵🇱" },
  { code: "BRL", symbol: "R$", flag: "🇧🇷" },
];
export const CURRENCY_CODES = CURRENCIES.map((c) => c.code);
export const DEFAULT_CURRENCY = "EUR";
export const CURRENCY_STORAGE_KEY = "menuverse-currency";

/**
 * Used only when the backend function cannot be reached (and in local development without Base44).
 * ECB reference rates per 1 EUR as of 19 Nov 2026 (rounded); the backend replaces them with live rates.
 * Keep in sync with base44/functions/getExchangeRates/entry.ts.
 */
export const FALLBACK_RATES = {
  USD: 1.1,
  GBP: 0.836,
  CHF: 0.926,
  CAD: 1.572,
  AUD: 1.638,
  JPY: 176,
  DKK: 7.474,
  SEK: 11.15,
  NOK: 10.65,
  PLN: 4.42,
  BRL: 6.48,
};

export const fractionDigits = (code) => (code === "JPY" ? 0 : 2);

/** Converts a EUR amount and rounds to 2 decimals (JPY to whole yen). */
export function convert(eur, code, rates) {
  if (code === "EUR") return eur;
  const rate = rates?.[code] ?? FALLBACK_RATES[code];
  if (!rate) return eur;
  const digits = fractionDigits(code);
  const factor = 10 ** digits;
  return Math.round(eur * rate * factor) / factor;
}

/**
 * Intl currency format options for an amount: whole amounts drop the decimals (€12, not €12,00),
 * others show 2 (JPY never has decimals). Shared by NumberFlow and plain formatting.
 */
export function currencyFormat(code, amount) {
  const digits = fractionDigits(code);
  const whole = Number.isInteger(amount);
  return {
    style: "currency",
    currency: code,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: whole ? 0 : digits,
    maximumFractionDigits: digits,
  };
}

export function formatPrice(amount, code, locale) {
  return new Intl.NumberFormat(locale, currencyFormat(code, amount)).format(amount);
}

/** Everything a plan card shows for one billing period and currency. */
export function planPricing(planId, { billing, currency, rates }) {
  const base = PLAN_PRICES[planId];
  if (!base) return null;
  const yearly = billing === "yearly";
  const perMonth = convert(yearly ? base.yearlyMonthly : base.monthly, currency, rates);
  return {
    now: 0,
    perMonth,
    regular: perMonth,
    yearlyTotal: yearly ? convert(base.yearlyTotal, currency, rates) : null,
  };
}

export function readStoredCurrency() {
  try {
    const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);
    return CURRENCY_CODES.includes(stored) ? stored : DEFAULT_CURRENCY;
  } catch {
    return DEFAULT_CURRENCY;
  }
}

export function storeCurrency(code) {
  try {
    localStorage.setItem(CURRENCY_STORAGE_KEY, code);
  } catch {
    /* storage unavailable */
  }
}
