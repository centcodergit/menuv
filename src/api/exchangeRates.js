import { getBase44, hasBackend } from "@/api/getBase44";
import { CURRENCY_CODES, FALLBACK_RATES } from "@/lib/pricing";

const CACHE_KEY = "menuverse-rates";
const MAX_AGE = 12 * 60 * 60 * 1000;

const valid = (rates) => rates && typeof rates === "object" && CURRENCY_CODES.every((c) => c === "EUR" || typeof rates[c] === "number");

/** Last good rates kept in the browser, so a returning visitor sees converted prices without a fetch. */
export function cachedRates() {
  try {
    const hit = JSON.parse(localStorage.getItem(CACHE_KEY) ?? "null");
    if (hit && valid(hit.rates) && Date.now() - Date.parse(hit.fetched_at) < MAX_AGE) return hit;
  } catch {
    /* storage unavailable or corrupt */
  }
  return null;
}

/**
 * Rates per 1 EUR from the `getExchangeRates` backend function (ECB via Frankfurter, cached 12 h server side).
 * Never throws: falls back to the hardcoded table so prices always render.
 */
export async function fetchExchangeRates() {
  if (!hasBackend) return { base: "EUR", rates: FALLBACK_RATES, fetched_at: null, source: "fallback" };
  try {
    const b = await getBase44();
    const res = await b.functions.invoke("getExchangeRates", {});
    const data = res?.data ?? res;
    if (!valid(data?.rates)) throw new Error("bad rates");
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ rates: data.rates, fetched_at: data.fetched_at ?? new Date().toISOString() }));
    } catch {
      /* storage unavailable */
    }
    return data;
  } catch {
    return { base: "EUR", rates: FALLBACK_RATES, fetched_at: null, source: "fallback" };
  }
}
