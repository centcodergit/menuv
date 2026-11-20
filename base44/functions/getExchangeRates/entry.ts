import { createClientFromRequest } from "npm:@base44/sdk@0.8.63";

/**
 * getExchangeRates (master prompt 3.5): EUR-based rates for the pricing currency selector.
 * Free ECB reference rates from Frankfurter (no key), cached for 12 hours in the ExchangeRateCache entity
 * (service role only), with a hardcoded table when both the API and the cache are unavailable.
 * Public: the pricing section calls it for anonymous visitors.
 */
const SYMBOLS = ["USD", "GBP", "CHF", "CAD", "AUD", "JPY", "DKK", "SEK", "NOK", "PLN", "BRL"];
const SOURCE = `https://api.frankfurter.dev/v1/latest?base=EUR&symbols=${SYMBOLS.join(",")}`;
const MAX_AGE_MS = 12 * 60 * 60 * 1000;

// ECB reference rates as of 19 Nov 2026 (rounded). Keep in sync with FALLBACK_RATES in src/lib/pricing.js.
const FALLBACK_RATES: Record<string, number> = {
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

const complete = (rates: unknown): rates is Record<string, number> =>
  !!rates && typeof rates === "object" && SYMBOLS.every((s) => typeof (rates as Record<string, unknown>)[s] === "number");

const headers = { "Cache-Control": "public, max-age=3600" };

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const cacheStore = base44.asServiceRole.entities.ExchangeRateCache;

  let cached: { id: string; rates: Record<string, number>; fetched_at: string } | null = null;
  try {
    const rows = await cacheStore.filter({ base: "EUR" }, "-fetched_at", 1);
    cached = rows?.[0] ?? null;
  } catch (error) {
    console.error("ExchangeRateCache read failed", error);
  }

  if (cached && complete(cached.rates) && Date.now() - Date.parse(cached.fetched_at) < MAX_AGE_MS) {
    return Response.json({ base: "EUR", rates: cached.rates, fetched_at: cached.fetched_at, source: "cache" }, { headers });
  }

  try {
    const res = await fetch(SOURCE, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) throw new Error(`Frankfurter ${res.status}`);
    const body = await res.json();
    if (!complete(body?.rates)) throw new Error("Incomplete rates");
    const rates = Object.fromEntries(SYMBOLS.map((s) => [s, body.rates[s]]));
    const fetched_at = new Date().toISOString();
    try {
      if (cached) await cacheStore.update(cached.id, { rates, fetched_at });
      else await cacheStore.create({ base: "EUR", rates, fetched_at });
    } catch (error) {
      console.error("ExchangeRateCache write failed", error);
    }
    return Response.json({ base: "EUR", rates, fetched_at, source: "live" }, { headers });
  } catch (error) {
    console.error("Frankfurter fetch failed", error);
    if (cached && complete(cached.rates)) {
      return Response.json({ base: "EUR", rates: cached.rates, fetched_at: cached.fetched_at, source: "stale-cache" }, { headers });
    }
    return Response.json({ base: "EUR", rates: FALLBACK_RATES, fetched_at: null, source: "fallback" }, { headers });
  }
});
