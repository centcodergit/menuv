import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { cachedRates, fetchExchangeRates } from "@/api/exchangeRates";
import { CURRENCY_STORAGE_KEY, FALLBACK_RATES, readStoredCurrency, storeCurrency } from "@/lib/pricing";

/**
 * Selected currency, persisted in localStorage `menuverse-currency` (default EUR), shared across components and
 * tabs through the storage event.
 */
export function useCurrency() {
  const [currency, setCurrencyState] = useState(readStoredCurrency);

  useEffect(() => {
    const sync = (e) => {
      // "storage" comes from other tabs (has a key); "mv:currency" from this tab (plain Event, no key).
      if (!e || e.type === "mv:currency" || e.key === CURRENCY_STORAGE_KEY) setCurrencyState(readStoredCurrency());
    };
    window.addEventListener("storage", sync);
    window.addEventListener("mv:currency", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("mv:currency", sync);
    };
  }, []);

  const setCurrency = useCallback((code) => {
    storeCurrency(code);
    setCurrencyState(code);
    window.dispatchEvent(new Event("mv:currency"));
  }, []);

  return [currency, setCurrency];
}

/**
 * Exchange rates (per 1 EUR). Starts from the browser cache or the fallback table so prices never wait on the
 * network; `enabled` lets the caller fetch only when a non-EUR currency is in play.
 */
export function useExchangeRates({ enabled = true } = {}) {
  const cached = cachedRates();
  const query = useQuery({
    queryKey: ["exchange-rates"],
    queryFn: fetchExchangeRates,
    enabled,
    staleTime: 12 * 60 * 60 * 1000,
    gcTime: 12 * 60 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
    initialData: cached ? { base: "EUR", rates: cached.rates, fetched_at: cached.fetched_at, source: "browser" } : undefined,
  });
  return {
    rates: query.data?.rates ?? FALLBACK_RATES,
    source: query.data?.source ?? "fallback",
    isLoading: query.isLoading,
  };
}
