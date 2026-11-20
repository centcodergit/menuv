import { CURRENCY_CODES, DEFAULT_CURRENCY, PLAN_IDS } from "@/lib/pricing";

/** sessionStorage flag set just before a Google / Microsoft round trip, so the return to /login finishes on its own. */
export const PROVIDER_FLAG = "mv-login-provider";

/**
 * A `?redirect=` value as a same-site path, or null. Accepts "/path?x#y" and bare names ("referrals" → "/referrals").
 * Rejects anything that could leave the site (absolute URLs, protocol-relative "//host", backslashes, schemes,
 * control characters) and /login itself (no loops). Prevents open redirects.
 */
export function safeRedirectPath(raw) {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (!value || value.length > 512) return null;
  if (/[\u0000-\u001f\u007f\\]/.test(value)) return null;
  let path = value;
  if (!path.startsWith("/")) {
    if (!/^[a-z0-9][a-z0-9/_-]*$/i.test(path)) return null;
    path = `/${path}`;
  }
  if (path.startsWith("//")) return null;
  try {
    const url = new URL(path, window.location.origin);
    if (url.origin !== window.location.origin) return null;
    if (/^\/login\/?$/i.test(url.pathname)) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

/**
 * Reads the login query (master prompt 3.4 / 3.5): `redirect` (chat | same-site path) and the pricing parameters
 * `plan`, `billing`, `currency`. Unknown values fall back to safe defaults.
 */
export function readLoginParams(search) {
  const p = new URLSearchParams(search);
  const rawRedirect = p.get("redirect");
  const chat = rawRedirect === "chat";
  const planId = p.get("plan");
  const plan = PLAN_IDS.includes(planId) ? planId : null;
  const billing = p.get("billing") === "yearly" ? "yearly" : "monthly";
  const code = (p.get("currency") ?? "").toUpperCase();
  const currency = CURRENCY_CODES.includes(code) ? code : DEFAULT_CURRENCY;
  return { chat, path: chat ? null : safeRedirectPath(rawRedirect), plan, billing, currency };
}

/**
 * Runs `cb` once the router has landed on `pathname` and the page curtain has had time to lift
 * (the login page itself has unmounted by then, so this lives outside React).
 */
export function whenOnPage(pathname, cb, delay = 500) {
  const start = performance.now();
  const tick = () => {
    if (window.location.pathname === pathname) {
      window.setTimeout(cb, delay);
      return;
    }
    if (performance.now() - start < 6000) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
