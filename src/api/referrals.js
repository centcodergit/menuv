import { getBase44, hasBackend } from "@/api/getBase44";

/**
 * Referral program data layer (master prompt 3.10). All writes go through backend functions (the Referral entity
 * is read-own / write-service-role), so codes stay unique and counts tamper-proof.
 */
export const SITE_URL = "https://menuverse.eu";
export const REFERRAL_GOAL = 3;
const STORED_KEY = "menuverse-ref";
const CLICKED_KEY = "menuverse-ref-clicked";
const CODE_RE = /^[A-Z0-9]{8}$/;

export const referralLink = (code) => `${SITE_URL}/?ref=${code}`;
export const normalizeCode = (raw) => (typeof raw === "string" ? raw.trim().toUpperCase() : "");
export const isValidCode = (code) => CODE_RE.test(code);

const data = (res) => res?.data ?? res;

/** The signed-in user's referral, created on first call: { code, link, clicks, signups, reward_status }. */
export async function fetchMyReferral() {
  const b = await getBase44();
  const res = await b.functions.invoke("getMyReferral", {});
  const r = data(res);
  if (!r?.code) throw new Error("No referral");
  return { ...r, link: referralLink(r.code) };
}

export function storedReferralCode() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORED_KEY) ?? "null");
    return raw && isValidCode(raw.code) ? raw.code : null;
  } catch {
    return null;
  }
}

export function clearStoredReferral() {
  try {
    localStorage.removeItem(STORED_KEY);
  } catch {
    /* storage unavailable */
  }
}

/**
 * `?ref=CODE` on any page: remember the code for the first sign-in, count one visit per code per browser, and
 * tidy the address bar. Runs when the browser is idle, never during the first paint.
 */
export async function captureReferralFromUrl() {
  const url = new URL(window.location.href);
  const code = normalizeCode(url.searchParams.get("ref"));
  if (!url.searchParams.has("ref")) return;
  url.searchParams.delete("ref");
  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  if (!isValidCode(code)) return;
  try {
    localStorage.setItem(STORED_KEY, JSON.stringify({ code, at: new Date().toISOString() }));
    const clicked = JSON.parse(localStorage.getItem(CLICKED_KEY) ?? "[]");
    if (clicked.includes(code) || !hasBackend) return;
    localStorage.setItem(CLICKED_KEY, JSON.stringify([...clicked, code].slice(-20)));
  } catch {
    return;
  }
  try {
    const b = await getBase44();
    await b.functions.invoke("trackReferralClick", { code });
  } catch {
    /* a lost visit count is not worth bothering the visitor */
  }
}

/** After sign-in: attach a stored code to this account (the function ignores self-referrals and older accounts). */
export async function claimStoredReferral() {
  const code = storedReferralCode();
  if (!code || !hasBackend) return null;
  try {
    const b = await getBase44();
    const res = data(await b.functions.invoke("claimReferral", { code }));
    clearStoredReferral();
    return res;
  } catch (error) {
    // Keep the code only for transient failures (network / 5xx); drop it when the server said no.
    const status = error?.status ?? error?.response?.status;
    if (status && status < 500) clearStoredReferral();
    return null;
  }
}

/** Share targets for a referral link. Messenger's web share needs a Facebook app id, so it is offered on touch only. */
export function shareTargets(link, text) {
  const message = text.includes(link) ? text : `${text} ${link}`;
  return {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(message)}`,
    messenger: `fb-messenger://share/?link=${encodeURIComponent(link)}`,
    native: typeof navigator !== "undefined" && typeof navigator.share === "function" ? { title: "Menuverse", text, url: link } : null,
  };
}
